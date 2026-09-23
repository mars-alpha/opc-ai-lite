"use client";

import { useEffect, useState } from "react";

export function LegacyCopyableGuide({
  text,
  label = "复制"
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      className={"copy-guide-button " + (copied ? "is-copied" : "")}
      type="button"
      onClick={copy}
      aria-live="polite"
    >
      {copied ? "已复制 ✓" : label}
    </button>
  );
}

