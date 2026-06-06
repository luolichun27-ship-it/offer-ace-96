import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface OptimizedResumeViewProps {
  content: string;
}

type Segment =
  | { type: "text"; value: string }
  | { type: "edit"; optimized: string; original: string; reason: string }
  | { type: "pending"; value: string };

// Parse text into segments. Supports streaming: an unfinished trailing
// "⟦..." with no closing "⟧" is shown as plain text until completed.
function parseSegments(input: string): Segment[] {
  const segs: Segment[] = [];
  const open = "⟦";
  const close = "⟧";
  const sep = "¦¦";

  let i = 0;
  while (i < input.length) {
    const start = input.indexOf(open, i);
    if (start === -1) {
      segs.push({ type: "text", value: input.slice(i) });
      break;
    }
    if (start > i) {
      segs.push({ type: "text", value: input.slice(i, start) });
    }
    const end = input.indexOf(close, start + 1);
    if (end === -1) {
      // unfinished while streaming
      segs.push({ type: "pending", value: input.slice(start) });
      break;
    }
    const inner = input.slice(start + 1, end);
    const parts = inner.split(sep);
    if (parts.length >= 2) {
      const [optimized, original, reason = ""] = parts;
      segs.push({
        type: "edit",
        optimized: optimized.trim(),
        original: original.trim(),
        reason: reason.trim(),
      });
    } else {
      segs.push({ type: "text", value: input.slice(start, end + 1) });
    }
    i = end + 1;
  }
  return segs;
}

export function OptimizedResumeView({ content }: OptimizedResumeViewProps) {
  if (!content) return null;
  const segments = parseSegments(content);

  return (
    <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground font-sans">
      {segments.map((seg, idx) => {
        if (seg.type === "text") {
          return <span key={idx}>{seg.value}</span>;
        }
        if (seg.type === "pending") {
          return (
            <span key={idx} className="text-muted-foreground/60">
              {seg.value}
            </span>
          );
        }
        return (
          <HoverCard key={idx} openDelay={80} closeDelay={80}>
            <HoverCardTrigger asChild>
              <mark className="rounded px-1 py-0.5 cursor-help bg-yellow-200/80 text-foreground hover:bg-yellow-300 transition-colors dark:bg-yellow-500/30 dark:hover:bg-yellow-500/50">
                {seg.optimized}
              </mark>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 text-sm space-y-2" side="top">
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">
                  原文
                </div>
                <div className="text-foreground line-through decoration-muted-foreground/40">
                  {seg.original || "（空）"}
                </div>
              </div>
              <div className="border-t border-border pt-2">
                <div className="text-xs font-semibold text-muted-foreground mb-1">
                  修改原因
                </div>
                <div className="text-foreground">{seg.reason || "—"}</div>
              </div>
            </HoverCardContent>
          </HoverCard>
        );
      })}
    </div>
  );
}
