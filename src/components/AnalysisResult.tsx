import ReactMarkdown from "react-markdown";

interface AnalysisResultProps {
  content: string;
  isStreaming: boolean;
}

export function AnalysisResult({ content, isStreaming }: AnalysisResultProps) {
  if (!content) return null;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-foreground">分析结果</h2>
        {isStreaming && (
          <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            生成中...
          </span>
        )}
      </div>
      <div className="bg-card border border-border rounded-lg p-6 prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-a:text-primary">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
