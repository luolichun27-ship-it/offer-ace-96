import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JDInput } from "@/components/JDInput";
import { ResumeUpload } from "@/components/ResumeUpload";
import { useToast } from "@/hooks/use-toast";

const JdOffer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jdText, setJdText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState<string | undefined>();

  const handleStart = () => {
    if (!jdText.trim()) {
      toast({ title: "请先粘贴 JD 内容", variant: "destructive" });
      return;
    }
    navigate("/results", {
      state: { jdText, resumeText, resumeFileName },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-to-b from-secondary/30 to-background">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h1 className="text-base font-semibold text-foreground">
              JD & Offer 分析
            </h1>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            把看不懂的 JD 变成拿 offer 的指南
          </h2>
          <p className="text-sm text-muted-foreground">
            粘贴 JD，可选上传简历，自动生成 JD 解读 · 工作日常 · 简历优化
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-6">
          <JDInput value={jdText} onChange={setJdText} />
          <ResumeUpload
            onTextExtracted={(text, fileName) => {
              setResumeText(text);
              setResumeFileName(fileName);
            }}
          />
          <Button
            variant="hero"
            size="lg"
            onClick={handleStart}
            disabled={!jdText.trim()}
            className="w-full h-12"
          >
            <Rocket className="h-5 w-5" />
            开始分析
          </Button>
        </div>
      </main>
    </div>
  );
};

export default JdOffer;
