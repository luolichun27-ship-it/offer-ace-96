import { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResumeUploadProps {
  onTextExtracted: (text: string) => void;
  disabled?: boolean;
}

export function ResumeUpload({ onTextExtracted, disabled }: ResumeUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    const text = await file.text();
    onTextExtracted(text);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setFileName(null);
    onTextExtracted("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        上传简历（可选，支持 .txt）
      </label>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          选择文件
        </Button>
        {fileName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-md">
            <FileText className="h-4 w-4" />
            <span>{fileName}</span>
            <button onClick={clear} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.text"
          onChange={handleChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
