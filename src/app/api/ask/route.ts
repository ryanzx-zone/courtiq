import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { buildDataContext } from "@/lib/askContext";
import { SYSTEM_PROMPT } from "@/lib/prompts";

const client = new Anthropic();

const ASK_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    analysis: {
      type: "string",
      description:
        "Main analysis. 2-4 paragraphs. Use **bold** for emphasis. Opinionated and insightful, not generic.",
    },
    keyStats: {
      type: "array",
      description:
        "2-5 key stats anchoring the analysis. Use exact values from the data context.",
      items: {
        type: "object",
        properties: {
          label: {
            type: "string",
            description: "Stat abbreviation, e.g. PPG, TS%, BPM, VORP",
          },
          value: {
            type: "string",
            description: "Formatted stat value, e.g. '28.1' or '60.1%' or '+8.2'",
          },
          context: {
            type: "string",
            description:
              "Short context, e.g. '3rd in NBA' or 'Elite efficiency' or 'MVP-tier'",
          },
        },
        required: ["label", "value", "context"],
        additionalProperties: false,
      },
    },
    verdict: {
      type: "string",
      description:
        "One punchy sentence summary or hot take. The kind of line you'd quote on Twitter.",
    },
    chartData: {
      anyOf: [
        { type: "null" },
        {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["radar", "bar", "line"],
              description:
                "radar = percentile comparison across categories; bar = head-to-head stats; line = trend / ranking across ordered points",
            },
            title: { type: "string" },
            data: {
              type: "array",
              description:
                "For radar: each row is one axis (label) with one number per series. For bar/line: each row is one x-axis category with one number per series. data.length is the number of categories/axes; values.length must equal series.length.",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  values: { type: "array", items: { type: "number" } },
                },
                required: ["label", "values"],
                additionalProperties: false,
              },
            },
            series: {
              type: "array",
              description:
                "One entry per series (e.g. one per player being compared). Order matches the position in each row's values[].",
              items: {
                type: "object",
                properties: { name: { type: "string" } },
                required: ["name"],
                additionalProperties: false,
              },
            },
          },
          required: ["type", "title", "data", "series"],
          additionalProperties: false,
        },
      ],
      description:
        "Optional chart data. Set to null unless a visualization genuinely adds value over plain text.",
    },
    followUps: {
      type: "array",
      description: "2-3 follow-up question suggestions building on the analysis.",
      items: { type: "string" },
    },
  },
  required: ["analysis", "keyStats", "verdict", "chartData", "followUps"],
  additionalProperties: false,
};

interface AskRequestBody {
  question?: unknown;
  history?: unknown;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured. Add it to .env.local." },
      { status: 500 },
    );
  }

  let body: AskRequestBody;
  try {
    body = (await req.json()) as AskRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { question, history } = body;
  if (typeof question !== "string" || !question.trim()) {
    return NextResponse.json(
      { error: "Field 'question' is required (non-empty string)." },
      { status: 400 },
    );
  }
  if (question.length > 1000) {
    return NextResponse.json(
      { error: "Question too long (max 1000 chars)." },
      { status: 400 },
    );
  }
  const safeHistory: Anthropic.MessageParam[] = Array.isArray(history)
    ? (history as Anthropic.MessageParam[])
    : [];

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: [
        { type: "text", text: SYSTEM_PROMPT },
        {
          type: "text",
          text: buildDataContext(),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [...safeHistory, { role: "user", content: question }],
      output_config: {
        format: {
          type: "json_schema",
          schema: ASK_RESPONSE_SCHEMA,
        },
      },
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      console.error("Ask API: no text block in response", response.content);
      return NextResponse.json(
        { error: "No text response from Claude" },
        { status: 502 },
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch (e) {
      console.error("Ask API: JSON parse failed", textBlock.text);
      return NextResponse.json(
        { error: "Failed to parse Claude response" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ...(parsed as object),
      _usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cache_read: response.usage.cache_read_input_tokens ?? 0,
        cache_write: response.usage.cache_creation_input_tokens ?? 0,
      },
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Invalid Anthropic API key" },
        { status: 401 },
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Rate limited. Try again in a moment." },
        { status: 429 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status ?? 500 },
      );
    }
    console.error("Ask API: unexpected error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
