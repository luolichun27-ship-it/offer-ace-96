import { Textarea } from "@/components/ui/textarea";

interface JDInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function JDInput({ value, onChange, disabled }: JDInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        请输入岗位JD（支持中英文）
      </label>
      <Textarea
        placeholder="在这里粘贴JD描述..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="min-h-[200px] resize-y bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
      />
    </div>
  );
}
