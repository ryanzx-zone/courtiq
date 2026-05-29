import type { AskResponse } from "@/types";

const DELIMITER = "===DATA===";
const ERROR_MARKER = "===ERROR===";

export interface AskMessage {
  role: "user" | "assistant";
  content: string;
}

/** Analysis prose streamed so far, hiding any partial trailing delimiter. */
export function visibleAnalysis(accumulated: string): string {
  const idx = accumulated.indexOf(DELIMITER);
  if (idx !== -1) return accumulated.slice(0, idx);
  for (let len = Math.min(DELIMITER.length - 1, accumulated.length); len > 0; len--) {
    if (accumulated.endsWith(DELIMITER.slice(0, len))) {
      return accumulated.slice(0, accumulated.length - len);
    }
  }
  return accumulated;
}

/**
 * POST a question to /api/ask and consume the streamed response.
 * `onAnalysis` is called with the progressively growing analysis prose.
 * Resolves with the parsed AskResponse, or throws on error.
 */
export async function streamAsk(
  question: string,
  history: AskMessage[],
  onAnalysis: (text: string) => void,
): Promise<AskResponse> {
  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  if (!res.body) throw new Error("No response stream");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    accumulated += decoder.decode(value, { stream: true });
    if (accumulated.includes(ERROR_MARKER)) {
      throw new Error(
        accumulated.split(ERROR_MARKER)[1]?.trim() || "Stream error",
      );
    }
    onAnalysis(visibleAnalysis(accumulated));
  }

  const [analysisPart, dataPart] = accumulated.split(DELIMITER);
  let structured: Partial<AskResponse> = {};
  if (dataPart) {
    try {
      structured = JSON.parse(dataPart.trim());
    } catch {
      // Malformed meta — degrade gracefully to analysis-only
    }
  }

  return {
    analysis: (analysisPart ?? accumulated).trim(),
    keyStats: structured.keyStats ?? [],
    verdict: structured.verdict ?? "",
    chartData: structured.chartData ?? null,
    followUps: structured.followUps ?? [],
  };
}
