import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronDown, ChevronUp, RotateCcw, Settings2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { TaskDef } from "@/lib/expansion-tasks";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: TaskDef;
  prompt: string;
  onPromptChange: (next: string) => void;
  onReset: () => void;
  onRegenerate: () => void;
  output: string;
  isStreaming: boolean;
  disabled: boolean;
}

export function TaskCard({
  task,
  prompt,
  onPromptChange,
  onReset,
  onRegenerate,
  output,
  isStreaming,
  disabled,
}: TaskCardProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border bg-secondary/40">
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-2xl leading-none mt-0.5">{task.icon}</span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {task.title}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {task.subtitle}
            </p>
          </div>
        </div>
        {isStreaming && (
          <Badge variant="secondary" className="gap-1.5 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            生成中
          </Badge>
        )}
      </div>

      {/* Prompt config */}
      <div className="border-b border-border">
        <button
          type="button"
          onClick={() => setShowPrompt((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Settings2 className="h-3.5 w-3.5" />
            Prompt 配置
          </span>
          {showPrompt ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {showPrompt && (
          <div className="px-4 pb-3 space-y-2">
            <Textarea
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              disabled={disabled}
              className="min-h-[160px] font-mono text-xs resize-y"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>支持变量：{"{{query}} {{scene}} {{count}}"}</span>
              <Button variant="ghost" size="sm" onClick={onReset} disabled={disabled} className="h-7 px-2 text-xs">
                <RotateCcw className="h-3 w-3" />
                恢复默认
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Output */}
      <div className="flex-1 p-4 min-h-[160px]">
        {output ? (
          <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-h3:text-sm prose-h3:font-semibold prose-h3:mt-3 prose-h3:mb-1.5">
            <ReactMarkdown>{output}</ReactMarkdown>
          </div>
        ) : (
          <div className={cn(
            "h-full flex items-center justify-center text-xs text-muted-foreground/70 italic"
          )}>
            {isStreaming ? "正在思考…" : "点击下方按钮生成结果"}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-border bg-secondary/20">
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={disabled}
          className="flex-1"
        >
          🔄 重新生成
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          disabled={!output}
          className="px-3"
          title="复制结果"
        >
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
