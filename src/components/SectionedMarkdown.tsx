import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SectionedMarkdownProps {
  content: string;
}

interface Section {
  title: string;
  body: string;
}

/** Split markdown by top-level "## " headings into collapsible sections. */
function splitByH2(md: string): { preamble: string; sections: Section[] } {
  const lines = md.split("\n");
  const sections: Section[] = [];
  let preambleLines: string[] = [];
  let current: Section | null = null;

  for (const line of lines) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m && !line.startsWith("###")) {
      if (current) sections.push(current);
      current = { title: m[1].trim(), body: "" };
    } else {
      if (current) current.body += (current.body ? "\n" : "") + line;
      else preambleLines.push(line);
    }
  }
  if (current) sections.push(current);
  return { preamble: preambleLines.join("\n").trim(), sections };
}

const proseClass = `prose prose-sm max-w-none text-foreground
  prose-headings:text-foreground prose-headings:font-semibold
  prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-sm prose-h3:text-primary
  prose-p:text-foreground prose-p:leading-7 prose-p:my-3
  prose-ul:my-3 prose-ul:space-y-2 prose-ol:my-3 prose-ol:space-y-2
  prose-li:text-foreground prose-li:leading-7 prose-li:marker:text-primary
  prose-strong:text-foreground prose-strong:font-semibold
  prose-a:text-primary
  prose-hr:my-6 prose-hr:border-border
  prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground`;

export function SectionedMarkdown({ content }: SectionedMarkdownProps) {
  const { preamble, sections } = useMemo(() => splitByH2(content), [content]);

  // While streaming with no headings yet, fall back to plain rendering.
  if (sections.length === 0) {
    return (
      <div className={proseClass}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }

  const defaultOpen = sections.map((_, i) => `item-${i}`);

  return (
    <div className="space-y-4">
      {preamble && (
        <div className={proseClass}>
          <ReactMarkdown>{preamble}</ReactMarkdown>
        </div>
      )}
      <Accordion type="multiple" defaultValue={defaultOpen} className="space-y-3">
        {sections.map((s, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="border border-border rounded-xl bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow data-[state=open]:shadow-md"
          >
            <AccordionTrigger className="px-5 py-4 hover:no-underline group">
              <div className="flex items-center gap-3 text-left">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold shrink-0">
                  {i + 1}
                </span>
                <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                  {s.title}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5 pt-1">
              <div className={proseClass}>
                <ReactMarkdown>{s.body.trim()}</ReactMarkdown>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
