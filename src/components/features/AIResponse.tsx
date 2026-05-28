import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { AskResponse } from "@/types";
import { AIChart } from "./AIChart";

interface AIResponseProps {
  response: AskResponse;
  onFollowUp: (question: string) => void;
}

export function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function AIResponse({ response, onFollowUp }: AIResponseProps) {
  const paragraphs = response.analysis.split(/\n{2,}/).filter((p) => p.trim());

  return (
    <div className="space-y-5 rounded-lg border border-edge bg-card p-6">
      {/* Brand header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-orange-500" aria-hidden="true" />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-orange-500">
          CourtIQ analysis
        </span>
      </div>

      {/* Analysis text */}
      <div className="space-y-3 text-slate-200">
        {paragraphs.map((para, i) => (
          <p key={i} className="leading-relaxed">
            {renderInlineMarkdown(para)}
          </p>
        ))}
      </div>

      {/* Key stats */}
      {response.keyStats && response.keyStats.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {response.keyStats.map((stat, i) => (
            <Badge
              key={i}
              label={stat.label}
              value={stat.value}
              context={stat.context}
              accent="orange"
            />
          ))}
        </div>
      )}

      {/* Verdict */}
      {response.verdict && (
        <div className="border-l-2 border-orange-500 pl-4 py-1 text-slate-100 italic">
          {response.verdict}
        </div>
      )}

      {/* Chart */}
      {response.chartData && (
        <div className="space-y-2 pt-2">
          {response.chartData.title && (
            <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
              {response.chartData.title}
            </h4>
          )}
          <div className="rounded-md border border-edge bg-surface/50 p-3">
            <AIChart chart={response.chartData} height={320} />
          </div>
        </div>
      )}

      {/* Follow-ups */}
      {response.followUps && response.followUps.length > 0 && (
        <div className="space-y-2 border-t border-edge pt-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            Suggested follow-ups
          </p>
          <div className="flex flex-wrap gap-2">
            {response.followUps.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onFollowUp(q)}
                className="rounded-full border border-edge bg-canvas px-3 py-1.5 text-left text-xs text-slate-300 transition-colors hover:border-orange-500/40 hover:text-orange-400"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
