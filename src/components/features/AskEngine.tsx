"use client";

import { Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SearchBar } from "@/components/ui/SearchBar";
import { streamAsk } from "@/lib/askClient";
import type { AskResponse } from "@/types";
import { AIResponse, renderInlineMarkdown } from "./AIResponse";

interface Turn {
  question: string;
  response: AskResponse | null;
  streamingText: string | null;
  error: string | null;
}

const PLACEHOLDERS = [
  "Who's the MVP frontrunner this season?",
  "Compare Shai vs Luka — who's better?",
  "What team has the best defense in the league?",
  "Is Victor Wembanyama living up to the hype?",
  "Best value picks in the last 5 drafts?",
];

interface AskEngineProps {
  initialQuestion?: string;
}

export function AskEngine({ initialQuestion }: AskEngineProps) {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const initialFiredRef = useRef(false);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const turnsRef = useRef<Turn[]>([]);

  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);

  const handleSubmit = useCallback(async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    setInput("");
    setLoading(true);
    setTurns((prev) => [
      ...prev,
      { question: trimmed, response: null, streamingText: null, error: null },
    ]);

    const updateLast = (patch: Partial<Turn>) => {
      setTurns((prev) => {
        const next = [...prev];
        next[next.length - 1] = { ...next[next.length - 1], ...patch };
        return next;
      });
    };

    const history = turnsRef.current.flatMap((t) => {
      if (!t.response) return [];
      return [
        { role: "user" as const, content: t.question },
        { role: "assistant" as const, content: t.response.analysis },
      ];
    });

    try {
      const response = await streamAsk(trimmed, history, (text) =>
        updateLast({ streamingText: text }),
      );
      updateLast({ response, streamingText: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      updateLast({ error: msg, streamingText: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuestion && !initialFiredRef.current) {
      initialFiredRef.current = true;
      handleSubmit(initialQuestion);
    }
  }, [initialQuestion, handleSubmit]);

  useEffect(() => {
    if (input) return;
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(id);
  }, [input]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, loading]);

  return (
    <>
      <div className="flex flex-col gap-8 pb-40">
        {turns.length === 0 && !loading && <EmptyState onPick={handleSubmit} />}

        <div className="space-y-8">
          {turns.map((turn, i) => (
            <TurnCard
              key={i}
              turn={turn}
              onFollowUp={handleSubmit}
              isPending={i === turns.length - 1 && loading}
            />
          ))}
        </div>

        <div ref={threadEndRef} />
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-canvas via-canvas/90 to-transparent px-6 pb-6 pt-12">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (loading) return;
            handleSubmit(input);
          }}
          className="pointer-events-auto mx-auto max-w-3xl"
        >
          <SearchBar
            value={input}
            onChange={setInput}
            placeholder={
              input ? "Ask a follow-up..." : PLACEHOLDERS[placeholderIndex]
            }
            size="lg"
          />
        </form>
      </div>
    </>
  );
}

function TurnCard({
  turn,
  onFollowUp,
  isPending,
}: {
  turn: Turn;
  onFollowUp: (q: string) => void;
  isPending: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg border border-edge bg-card/50 px-4 py-3 text-slate-100">
          {turn.question}
        </div>
      </div>

      {turn.error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <span className="font-mono text-xs uppercase tracking-wider text-red-400">
            Error:
          </span>{" "}
          {turn.error}
        </div>
      ) : turn.response ? (
        <AIResponse response={turn.response} onFollowUp={onFollowUp} />
      ) : turn.streamingText !== null ? (
        <StreamingView text={turn.streamingText} />
      ) : isPending ? (
        <div className="flex items-center gap-4 rounded-lg border border-edge bg-card px-6 py-6">
          <LoadingSpinner size={32} />
          <span className="font-mono text-xs uppercase tracking-wider text-slate-500">
            CourtIQ is thinking...
          </span>
        </div>
      ) : null}
    </div>
  );
}

function StreamingView({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim());

  return (
    <div className="space-y-5 rounded-lg border border-edge bg-card p-6">
      <div className="flex items-center gap-2">
        <Sparkles
          className="h-4 w-4 animate-pulse text-orange-500"
          aria-hidden="true"
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-orange-500">
          CourtIQ analysis
        </span>
      </div>

      <div className="space-y-3 text-slate-200">
        {paragraphs.map((para, i) => (
          <p key={i} className="leading-relaxed">
            {renderInlineMarkdown(para)}
            {i === paragraphs.length - 1 && (
              <span className="ml-0.5 inline-block h-4 w-[3px] translate-y-0.5 animate-pulse bg-orange-500 align-middle" />
            )}
          </p>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <h2 className="font-display text-4xl tracking-wider text-slate-100">
        Ask anything about the <span className="text-orange-500">NBA</span>
      </h2>
      <p className="max-w-md text-slate-400">
        Stats on 61 current players, all 30 teams, and the last 10 drafts. Pick a
        starter question or type your own below.
      </p>

      <div className="mt-2 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {PLACEHOLDERS.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPick(p)}
            className="rounded-lg border border-edge bg-card px-4 py-3 text-left text-sm text-slate-300 transition-colors hover:border-orange-500/40 hover:text-slate-100"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
