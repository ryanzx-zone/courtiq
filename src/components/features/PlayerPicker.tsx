"use client";

import { ChevronDown, Search, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Player } from "@/types";

interface PlayerPickerProps {
  players: Player[];
  value: Player | null;
  onChange: (player: Player | null) => void;
  placeholder?: string;
  /** Other players to mark as already-picked (e.g. selected in the other slot) */
  excludeIds?: string[];
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export function PlayerPicker({
  players,
  value,
  onChange,
  placeholder = "Choose player",
  excludeIds = [],
}: PlayerPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const excludeSet = useMemo(() => new Set(excludeIds), [excludeIds]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onPointer(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return players.filter(
      (p) => !excludeSet.has(p.id) && (!q || p.name.toLowerCase().includes(q)),
    );
  }, [players, excludeSet, query]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-lg border border-edge bg-card px-4 py-3 text-left transition-colors hover:border-orange-500/40"
      >
        <Avatar player={value} />
        <div className="flex-1 min-w-0">
          {value ? (
            <>
              <div className="truncate font-medium text-slate-100">
                {value.name}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                {value.team} · {value.position}
              </div>
            </>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </div>
        {value && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear selection"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onChange(null);
              }
            }}
            className="text-slate-500 hover:text-slate-200 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </span>
        )}
        <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-lg border border-edge bg-card shadow-xl">
          <div className="relative border-b border-edge">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search players..."
              className="w-full bg-transparent py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-slate-500">
                No matches
              </li>
            ) : (
              filtered.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(p);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-card-hover"
                  >
                    <Avatar player={p} small />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm text-slate-100">
                        {p.name}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                        {p.team} · {p.position}
                      </div>
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function Avatar({ player, small }: { player: Player | null; small?: boolean }) {
  const size = small ? "h-9 w-9" : "h-12 w-12";
  if (!player) {
    return (
      <div
        className={`${size} flex shrink-0 items-center justify-center rounded-md bg-surface text-slate-600`}
      >
        ?
      </div>
    );
  }
  return (
    <div
      className={`${size} relative shrink-0 overflow-hidden rounded-md bg-surface`}
    >
      {player.headshot_url ? (
        <Image
          src={player.headshot_url}
          alt={player.name}
          fill
          sizes="48px"
          className="object-cover object-top"
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-display text-sm tracking-wider text-slate-500">
          {initials(player.name)}
        </div>
      )}
    </div>
  );
}
