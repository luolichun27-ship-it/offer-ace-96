import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JDInput } from "@/components/JDInput";
import { ResumeUpload } from "@/components/ResumeUpload";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [jdText, setJdText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (!jdText.trim()) {
      toast({ title: "请先输入岗位JD", variant: "destructive" });
      return;
    }

    navigate("/results", {
      state: {
        jdText,
        resumeText: resumeText || undefined,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
            <Sparkles className="h-3 w-3" />
            AI 驱动
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground font-display tracking-tight">
            找工作神器
          </h1>
          <p className="text-primary-foreground/70 text-base md:text-lg">
            把看不懂的JD，变成拿offer的行动指南
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8">
        <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-glow space-y-6">
          <JDInput value={jdText} onChange={setJdText} disabled={false} />
          <ResumeUpload onTextExtracted={setResumeText} disabled={false} />
          <Button
            variant="hero"
            size="lg"
            onClick={handleAnalyze}
            disabled={!jdText.trim()}
            className="w-full"
          >
            <Rocket className="h-5 w-5" />
            开始分析
          </Button>
        </div>

        <div className="py-8 text-center text-xs text-muted-foreground">
          由 AI 驱动 · 你的隐私数据不会被存储
        </div>
      </div>
    </div>
  );
};

export default Index;
