import { useState } from "react";
import { Settings, ChevronDown, ChevronUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface AdvancedSettingsProps {
  customPrompt: string;
  onPromptChange: (value: string) => void;
  disabled?: boolean;
}

export function AdvancedSettings({ customPrompt, onPromptChange, disabled }: AdvancedSettingsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-secondary/50"
      >
        <span className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          高级设置（Prompt配置）
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="p-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            自定义系统Prompt，留空使用默认分析模板
          </p>
          <Textarea
            placeholder="输入自定义Prompt..."
            value={customPrompt}
            onChange={(e) => onPromptChange(e.target.value)}
            disabled={disabled}
            className="min-h-[120px] resize-y bg-card text-sm"
          />
        </div>
      )}
    </div>
  );
}
