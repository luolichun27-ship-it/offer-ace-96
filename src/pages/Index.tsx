import { useState } from "react";
import { Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JDInput } from "@/components/JDInput";
import { ResumeUpload } from "@/components/ResumeUpload";
import { AdvancedSettings } from "@/components/AdvancedSettings";
import { AnalysisResult } from "@/components/AnalysisResult";
import { streamAnalysis } from "@/lib/stream-chat";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [jdText, setJdText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!jdText.trim()) {
      toast({ title: "请先输入岗位JD", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult("");

    let accumulated = "";

    try {
      await streamAnalysis({
        jdText,
        resumeText: resumeText || undefined,
        customPrompt: customPrompt || undefined,
        onDelta: (chunk) => {
          accumulated += chunk;
          setResult(accumulated);
        },
        onDone: () => setIsLoading(false),
        onError: (error) => {
          toast({ title: "分析失败", description: error, variant: "destructive" });
          setIsLoading(false);
        },
      });
    } catch {
      toast({ title: "网络错误", description: "请检查网络连接后重试", variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
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

      {/* Main form */}
      <div className="max-w-2xl mx-auto px-4 -mt-8">
        <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-glow space-y-6">
          <JDInput value={jdText} onChange={setJdText} disabled={isLoading} />
          <ResumeUpload onTextExtracted={setResumeText} disabled={isLoading} />
          <AdvancedSettings
            customPrompt={customPrompt}
            onPromptChange={setCustomPrompt}
            disabled={isLoading}
          />
          <Button
            variant="hero"
            size="lg"
            onClick={handleAnalyze}
            disabled={isLoading || !jdText.trim()}
            className="w-full"
          >
            <Rocket className="h-5 w-5" />
            {isLoading ? "分析中..." : "开始分析"}
          </Button>
        </div>

        <AnalysisResult content={result} isStreaming={isLoading} />

        <div className="py-8 text-center text-xs text-muted-foreground">
          由 AI 驱动 · 你的隐私数据不会被存储
        </div>
      </div>
    </div>
  );
};

export default Index;
