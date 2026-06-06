import { TAB_CONFIG, type AnalysisTab } from "@/lib/default-prompts";
import { OptimizedResumeView } from "./OptimizedResumeView";
import { SectionedMarkdown } from "./SectionedMarkdown";

interface ResultPanelProps {
  tab: AnalysisTab;
  content: string;
  isStreaming: boolean;
  resumeFileName?: string;
}

export function ResultPanel({
  tab,
  content,
  isStreaming,
  resumeFileName,
}: ResultPanelProps) {
  const config = TAB_CONFIG[tab];
  const isResume = tab === "resumeOptimize";

  return (
    <div className="h-full flex flex-col border border-border rounded-xl overflow-hidden bg-card shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border">
        <span className="text-lg">{config.icon}</span>
        <h3 className="text-sm font-semibold text-foreground">
          {config.label}结果
        </h3>
        {isStreaming && (
          <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium ml-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            生成中...
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto p-5 sm:p-6">
        {content ? (
          isResume ? (
            <OptimizedResumeView
              content={content}
              originalFileName={resumeFileName}
            />
          ) : (
            <SectionedMarkdown content={content} />
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
