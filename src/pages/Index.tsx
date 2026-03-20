import { useState, useCallback } from "react";
import { Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { JDInput } from "@/components/JDInput";
import { ResumeUpload } from "@/components/ResumeUpload";
import { PromptEditor } from "@/components/PromptEditor";
import { ResultPanel } from "@/components/ResultPanel";
import { DEFAULT_PROMPTS, TAB_CONFIG, type AnalysisTab } from "@/lib/default-prompts";
import { streamAnalysis } from "@/lib/stream-chat";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [jdText, setJdText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [activeTab, setActiveTab] = useState<AnalysisTab>("jdAnalysis");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const [prompts, setPrompts] = useState({
    jdAnalysis: DEFAULT_PROMPTS.jdAnalysis,
    dailyWork: DEFAULT_PROMPTS.dailyWork,
    resumeOptimize: DEFAULT_PROMPTS.resumeOptimize,
  });
  const [results, setResults] = useState({
    jdAnalysis: "",
    dailyWork: "",
    resumeOptimize: "",
  });
  const [loading, setLoading] = useState({
    jdAnalysis: false,
    dailyWork: false,
    resumeOptimize: false,
  });

  const runAnalysis = useCallback(
    async (tab: AnalysisTab) => {
      if (!jdText.trim()) {
        toast({ title: "请先输入岗位JD", variant: "destructive" });
        return;
      }
      if (tab === "resumeOptimize" && !resumeText) {
        toast({ title: "简历优化需要上传简历", variant: "destructive" });
        return;
      }

      setLoading((prev) => ({ ...prev, [tab]: true }));
      setResults((prev) => ({ ...prev, [tab]: "" }));

      let accumulated = "";
      try {
        await streamAnalysis({
          jdText,
          resumeText: tab === "resumeOptimize" ? resumeText : undefined,
          customPrompt: prompts[tab],
          onDelta: (chunk) => {
            accumulated += chunk;
            setResults((prev) => ({ ...prev, [tab]: accumulated }));
          },
          onDone: () => setLoading((prev) => ({ ...prev, [tab]: false })),
          onError: (error) => {
            toast({ title: "分析失败", description: error, variant: "destructive" });
            setLoading((prev) => ({ ...prev, [tab]: false }));
          },
        });
      } catch {
        toast({ title: "网络错误", description: "请检查网络连接后重试", variant: "destructive" });
        setLoading((prev) => ({ ...prev, [tab]: false }));
      }
    },
    [jdText, resumeText, prompts, toast]
  );

  const handleAnalyze = () => {
    if (!jdText.trim()) {
      toast({ title: "请先输入岗位JD", variant: "destructive" });
      return;
    }
    setHasAnalyzed(true);
    runAnalysis("jdAnalysis");
    runAnalysis("dailyWork");
    if (resumeText) {
      runAnalysis("resumeOptimize");
    }
  };

  const isAnyLoading = loading.jdAnalysis || loading.dailyWork || loading.resumeOptimize;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="gradient-hero py-4 px-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-primary-foreground font-display tracking-tight">
            找工作神器
          </h1>
          <span className="text-primary-foreground/60 text-sm hidden sm:inline">
            把看不懂的JD，变成拿offer的行动指南
          </span>
        </div>
      </div>

      {/* Top input area */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-end">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <JDInput value={jdText} onChange={setJdText} disabled={isAnyLoading} />
              <div className="space-y-3">
                <ResumeUpload onTextExtracted={setResumeText} disabled={isAnyLoading} />
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={!jdText.trim() || isAnyLoading}
                  className="w-full"
                >
                  <Rocket className="h-5 w-5" />
                  {isAnyLoading ? "分析中..." : "开始分析"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading banner */}
      {isAnyLoading && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex items-center gap-3 text-sm text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            {loading.jdAnalysis && "🧠 正在解析JD... "}
            {loading.dailyWork && "⏱ 正在生成工作日常... "}
            {loading.resumeOptimize && "✨ 正在优化简历... "}
          </div>
        </div>
      )}

      {/* Tabs + content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {hasAnalyzed ? (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as AnalysisTab)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* Tab bar */}
            <div className="flex-shrink-0 border-b border-border bg-secondary/30 px-4">
              <div className="max-w-7xl mx-auto py-2">
                <TabsList className="w-fit">
                  {(Object.keys(TAB_CONFIG) as AnalysisTab[]).map((tab) => (
                    <TabsTrigger key={tab} value={tab} className="gap-1.5">
                      <span>{TAB_CONFIG[tab].icon}</span>
                      {TAB_CONFIG[tab].label}
                      {loading[tab] && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            {/* Tab content */}
            {(Object.keys(TAB_CONFIG) as AnalysisTab[]).map((tab) => (
              <TabsContent key={tab} value={tab} className="flex-1 mt-0 overflow-auto">
                <div className="max-w-7xl mx-auto px-4 py-4">
                  <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 min-h-[50vh]">
                    <PromptEditor
                      tab={tab}
                      value={prompts[tab]}
                      onChange={(v) => setPrompts((prev) => ({ ...prev, [tab]: v }))}
                      onRegenerate={() => runAnalysis(tab)}
                      disabled={loading[tab]}
                    />
                    <ResultPanel
                      tab={tab}
                      content={results[tab]}
                      isStreaming={loading[tab]}
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-3">
              <Sparkles className="h-12 w-12 mx-auto opacity-20" />
              <p className="text-lg font-medium">粘贴JD，点击「开始分析」</p>
              <p className="text-sm">分析结果将在此处展示</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
