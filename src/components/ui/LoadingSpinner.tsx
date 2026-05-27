interface LoadingSpinnerProps {
  size?: number;
  label?: string;
}

export function LoadingSpinner({ size = 40, label }: LoadingSpinnerProps) {
  return (
    <div
      className="flex flex-col items-center gap-3"
      role="status"
      aria-live="polite"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        className="animate-spin"
        aria-hidden="true"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-edge"
        />
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="40 100"
          className="text-orange-500"
        />
        <path
          d="M 5 25 Q 25 15 45 25 M 5 25 Q 25 35 45 25 M 25 5 Q 15 25 25 45 M 25 5 Q 35 25 25 45"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-orange-500/30"
        />
      </svg>
      {label && (
        <span className="font-mono text-xs uppercase tracking-wider text-slate-500">
          {label}
        </span>
      )}
    </div>
  );
}
