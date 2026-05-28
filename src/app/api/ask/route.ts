import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { buildDataContext } from "@/lib/askContext";
import { SYSTEM_PROMPT } from "@/lib/prompts";

const client = new Anthropic();

// Allow up to 60s — adaptive thinking + streamed generation can run long.
export const maxDuration = 60;

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

  const encoder = new TextEncoder();

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: "claude-opus-4-7",
          max_tokens: 8192,
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
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        // Log usage server-side for cost monitoring (visible in Vercel function logs)
        const final = await stream.finalMessage();
        console.log("Ask usage:", JSON.stringify(final.usage));

        controller.close();
      } catch (err) {
        const msg =
          err instanceof Anthropic.APIError
            ? err.message
            : "Failed to generate a response. Please try again.";
        console.error("Ask API stream error:", err);
        try {
          controller.enqueue(encoder.encode(`\n===ERROR===\n${msg}`));
        } catch {
          /* controller may already be closed */
        }
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
