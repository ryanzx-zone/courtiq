"use client";

import Image from "next/image";
import { useState } from "react";

interface PlayerHeadshotProps {
  name: string;
  url: string | null;
  sizes: string;
  /** Tailwind text-size class for the initials fallback, e.g. "text-5xl". */
  initialsClassName?: string;
  priority?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Renders a player headshot from the NBA CDN, falling back to initials when
 * there's no URL OR when the image fails to load (e.g. a stale/wrong personId).
 * Must be placed inside a `relative`-positioned, sized container (uses `fill`).
 */
export function PlayerHeadshot({
  name,
  url,
  sizes,
  initialsClassName = "text-5xl",
  priority,
}: PlayerHeadshotProps) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center font-display tracking-wider text-slate-600 ${initialsClassName}`}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={name}
      fill
      sizes={sizes}
      className="object-cover object-top"
      unoptimized
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
