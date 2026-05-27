"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  size?: "sm" | "md" | "lg";
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  autoFocus,
  size = "md",
}: SearchBarProps) {
  const [internal, setInternal] = useState("");
  const controlled = value !== undefined;
  const current = controlled ? (value ?? "") : internal;

  function setValue(next: string) {
    if (!controlled) setInternal(next);
    onChange?.(next);
  }

  const sizes = {
    sm: "h-9 text-sm pl-9 pr-9",
    md: "h-11 text-base pl-11 pr-11",
    lg: "h-14 text-lg pl-14 pr-14",
  } as const;

  const iconSize = {
    sm: "h-4 w-4 left-3",
    md: "h-5 w-5 left-4",
    lg: "h-6 w-6 left-5",
  } as const;

  return (
    <div className="relative w-full">
      <Search
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-500 ${iconSize[size]}`}
        aria-hidden="true"
      />
      <input
        type="text"
        value={current}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full rounded-lg border border-edge bg-card text-slate-100 placeholder:text-slate-500 focus:border-orange-500/60 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-colors ${sizes[size]}`}
      />
      {current.length > 0 && (
        <button
          type="button"
          onClick={() => setValue("")}
          className={`absolute top-1/2 -translate-y-1/2 right-3 text-slate-500 hover:text-slate-200`}
          aria-label="Clear search"
        >
          <X className={iconSize[size].split(" ")[0] + " " + iconSize[size].split(" ")[1]} />
        </button>
      )}
    </div>
  );
}
