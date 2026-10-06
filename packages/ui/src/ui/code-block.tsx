"use client";

import React, { useState, useMemo } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "../utils";

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
  maxHeight?: string;
}

export function CodeBlock({
  code,
  language = "typescript",
  filename,
  showLineNumbers = true,
  className,
  maxHeight = "400px",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const highlightedHtml = useMemo(() => {
    const trimmed = code.trim();
    const langKey = language.toLowerCase();
    const grammar =
      Prism.languages[langKey] ||
      Prism.languages.typescript ||
      Prism.languages.javascript ||
      Prism.languages.clike;

    if (!grammar) return trimmed;

    try {
      return Prism.highlight(trimmed, grammar, langKey);
    } catch {
      return trimmed;
    }
  }, [code, language]);

  const lines = useMemo(() => {
    return code.trim().split("\n");
  }, [code]);

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border/80 bg-[#0d0e14] shadow-xl overflow-hidden font-mono text-[12px]",
        className
      )}
    >
      {/* Top IDE Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#13141c]/90 border-b border-border/60 backdrop-blur-md select-none">
        <div className="flex items-center gap-2">
          {/* macOS window control dots */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70 border border-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 border border-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 border border-emerald-500/80" />
          </div>

          {filename ? (
            <span className="text-xs text-muted-foreground/90 font-sans font-medium flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-primary/80" />
              {filename}
            </span>
          ) : (
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase font-mono px-1.5 py-0.5 rounded bg-secondary/50 border border-border/40">
              {language}
            </span>
          )}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium font-sans text-muted-foreground hover:text-foreground bg-secondary/40 hover:bg-secondary border border-border/50 hover:border-border transition-all duration-150 active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 stroke-[2]" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Container */}
      <div
        className="relative overflow-x-auto p-3.5 leading-relaxed"
        style={{ maxHeight }}
      >
        <div className="flex">
          {/* Line Numbers */}
          {showLineNumbers && lines.length > 1 && (
            <div
              className="select-none pr-4 text-right text-muted-foreground/30 font-mono text-[11px] leading-relaxed flex flex-col shrink-0 border-r border-border/30 mr-3.5"
              aria-hidden="true"
            >
              {lines.map((_, i) => (
                <span key={i} className="leading-relaxed">
                  {i + 1}
                </span>
              ))}
            </div>
          )}

          {/* Highlighted Code */}
          <pre className="flex-1 overflow-x-auto text-[12px] font-mono leading-relaxed text-zinc-100 whitespace-pre focus:outline-none">
            <code
              className={`language-${language}`}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </pre>
        </div>
      </div>
    </div>
  );
}
