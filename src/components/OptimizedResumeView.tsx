import { useMemo, useRef, useState } from "react";
import { FileText, FileType2, Loader2 } from "lucide-react";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
} from "docx";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface OptimizedResumeViewProps {
  content: string;
  originalFileName?: string;
}

type Segment =
  | { type: "text"; value: string }
  | { type: "edit"; optimized: string; original: string; reason: string }
  | { type: "pending"; value: string };

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
    if (start > i) segs.push({ type: "text", value: input.slice(i, start) });
    const end = input.indexOf(close, start + 1);
    if (end === -1) {
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

/** Flatten segments to plain optimized text (uses optimized values, no markers). */
function toPlainText(segments: Segment[]): string {
  return segments
    .map((s) =>
      s.type === "text" ? s.value : s.type === "edit" ? s.optimized : ""
    )
    .join("");
}

/** Detect if a line is likely a heading: short, no punctuation at end, all-caps or 标题样式. */
function isLikelyHeading(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > 24) return false;
  if (/[，。,.;:；：]$/.test(t)) return false;
  // common resume section keywords
  if (
    /^(教育|工作|实习|项目|技能|个人|自我|获奖|证书|荣誉|语言|兴趣|联系|基本)/.test(
      t
    )
  )
    return true;
  if (/[A-Z]{3,}/.test(t) && t === t.toUpperCase()) return true;
  return false;
}

export function OptimizedResumeView({
  content,
  originalFileName,
}: OptimizedResumeViewProps) {
  const paperRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);

  const segments = useMemo(() => parseSegments(content), [content]);
  const plainText = useMemo(() => toPlainText(segments), [segments]);

  const baseName = (originalFileName || "优化后简历").replace(/\.[^.]+$/, "");

  const handleExportPdf = async () => {
    if (!paperRef.current) return;
    setExporting("pdf");
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: [12, 12, 12, 12],
          filename: `${baseName}_优化版.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          
        })
        .from(paperRef.current)
        .save();
    } finally {
      setExporting(null);
    }
  };

  const handleExportDocx = async () => {
    setExporting("docx");
    try {
      const lines = plainText.split("\n");
      const paragraphs = lines.map((raw) => {
        const line = raw.replace(/\s+$/, "");
        if (!line.trim()) {
          return new Paragraph({ children: [new TextRun("")] });
        }
        if (isLikelyHeading(line)) {
          return new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: line.trim(), bold: true, size: 28 }),
            ],
          });
        }
        return new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { line: 320 },
          children: [new TextRun({ text: line, size: 22 })],
        });
      });

      const doc = new Document({
        styles: {
          default: {
            document: { run: { font: "Calibri", size: 22 } },
          },
        },
        sections: [
          {
            properties: {
              page: {
                margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
              },
            },
            children: paragraphs,
          },
        ],
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${baseName}_优化版.docx`);
    } finally {
      setExporting(null);
    }
  };

  if (!content) return null;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-1">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-yellow-200/80 dark:bg-yellow-500/40 border border-yellow-300/60" />
          黄色高亮为优化处，鼠标悬停查看原文与修改原因
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            disabled={!!exporting}
            className="gap-1.5"
          >
            {exporting === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            下载 PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportDocx}
            disabled={!!exporting}
            className="gap-1.5"
          >
            {exporting === "docx" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileType2 className="h-4 w-4" />
            )}
            下载 Word
          </Button>
        </div>
      </div>

      {/* Paper-styled resume */}
      <div className="flex justify-center bg-muted/40 rounded-lg p-4 sm:p-6">
        <div
          ref={paperRef}
          className="resume-paper bg-white text-slate-900 shadow-lg rounded-md w-full max-w-[820px] px-10 py-12 whitespace-pre-wrap break-words leading-7 text-[14px] font-serif tracking-[0.01em]"
          style={{ minHeight: "1100px" }}
        >
          {segments.map((seg, idx) => {
            if (seg.type === "text") return <span key={idx}>{seg.value}</span>;
            if (seg.type === "pending")
              return (
                <span key={idx} className="text-slate-400">
                  {seg.value}
                </span>
              );
            return (
              <HoverCard key={idx} openDelay={80} closeDelay={80}>
                <HoverCardTrigger asChild>
                  <mark className="rounded px-1 py-0.5 cursor-help bg-yellow-200/80 text-slate-900 hover:bg-yellow-300 transition-colors">
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
      </div>
    </div>
  );
}
