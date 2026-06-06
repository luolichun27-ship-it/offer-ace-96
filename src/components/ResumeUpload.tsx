import { useState, useRef } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ResumeUploadProps {
  onTextExtracted: (text: string, fileName?: string) => void;
  disabled?: boolean;
}

async function extractPdf(file: File): Promise<string> {
  const pdfjs: any = await import("pdfjs-dist");
  // Use a CDN worker to avoid bundling complications
  const version = pdfjs.version;
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it: any) => it.str).join(" ") + "\n";
  }
  return text.trim();
}

async function extractDocx(file: File): Promise<string> {
  const mammoth: any = await import("mammoth/mammoth.browser");
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return (result.value || "").trim();
}

export function ResumeUpload({ onTextExtracted, disabled }: ResumeUploadProps) {
  const { toast } = useToast();
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setParsing(true);
    try {
      const name = file.name.toLowerCase();
      let text = "";
      if (name.endsWith(".pdf")) {
        text = await extractPdf(file);
      } else if (name.endsWith(".docx")) {
        text = await extractDocx(file);
      } else if (name.endsWith(".doc")) {
        toast({
          title: "暂不支持 .doc 格式",
          description: "请另存为 .docx 或 PDF 后上传",
          variant: "destructive",
        });
        clear();
        return;
      } else {
        text = await file.text();
      }

      if (!text.trim()) {
        toast({
          title: "未能提取到文本内容",
          description: "可能是扫描件或加密文档，请尝试其它格式",
          variant: "destructive",
        });
      }
      onTextExtracted(text, file.name);
    } catch (e) {
      console.error(e);
      toast({
        title: "简历解析失败",
        description: e instanceof Error ? e.message : "请尝试其它格式",
        variant: "destructive",
      });
      clear();
    } finally {
      setParsing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setFileName(null);
    onTextExtracted("", undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        上传简历（可选，支持 .txt / .pdf / .docx）
      </label>
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || parsing}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          选择文件
        </Button>
        {fileName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-md">
            {parsing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <span className="max-w-[180px] truncate">{fileName}</span>
            {parsing && <span className="text-xs">解析中…</span>}
            {!parsing && (
              <button
                onClick={clear}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.text,.md,.pdf,.docx"
          onChange={handleChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
