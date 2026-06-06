import ReactMarkdown from "react-markdown";
import { TAB_CONFIG, type AnalysisTab } from "@/lib/default-prompts";
import { OptimizedResumeView } from "./OptimizedResumeView";

interface ResultPanelProps {
  tab: AnalysisTab;
  content: string;
  isStreaming: boolean;
}

export function ResultPanel({ tab, content, isStreaming }: ResultPanelProps) {
  const config = TAB_CONFIG[tab];
  const isResume = tab === "resumeOptimize";

  return (
    <div className="h-full flex flex-col border border-border rounded-lg overflow-hidden bg-card">
      <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border">
        <span>{config.icon}</span>
        <h3 className="text-sm font-medium text-foreground">{config.label}结果</h3>
        {isResume && content && (
          <span className="text-xs text-muted-foreground ml-2 hidden md:inline">
            黄色高亮为优化处，鼠标悬停查看原文与原因
          </span>
        )}
        {isStreaming && (
          <span className="inline-flex items-center gap-1 text-xs text-primary font-medium ml-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            生成中...
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto p-6">
        {content ? (
          isResume ? (
            <OptimizedResumeView content={content} />
          ) : (
            <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-a:text-primary">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            点击"重新生成"或等待分析完成
          </div>
        )}
      </div>
    </div>
  );
}
