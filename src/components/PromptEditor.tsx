import { useState } from "react";
import { Settings, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DEFAULT_PROMPTS, type AnalysisTab } from "@/lib/default-prompts";

interface PromptEditorProps {
  tab: AnalysisTab;
  value: string;
  onChange: (value: string) => void;
  onRegenerate: () => void;
  disabled?: boolean;
}

export function PromptEditor({ tab, value, onChange, onRegenerate, disabled }: PromptEditorProps) {
  const [open, setOpen] = useState(false);

  const handleReset = () => {
    onChange(DEFAULT_PROMPTS[tab]);
  };

  return (
    <div className="h-full flex flex-col border border-border rounded-lg overflow-hidden bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-secondary/50"
      >
        <span className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Prompt配置
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={disabled}>
              <RotateCcw className="h-3 w-3" />
              恢复默认
            </Button>
          </div>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="flex-1 min-h-[200px] resize-y bg-background text-sm font-mono"
          />
        </div>
      )}

      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={disabled}
          className="w-full"
        >
          🔄 重新生成
        </Button>
      </div>
    </div>
  );
}
