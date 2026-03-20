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
      {/* Header with tabs */}
      <div className="gradient-hero py-3 px-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-primary-foreground font-display tracking-tight">
              找工作神器
            </h1>
          </div>

          {/* Top-level tab buttons */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as AnalysisTab)}
          >
            <TabsList>
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
          </Tabs>

          <div className="w-24" />
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

      {/* Main content: left input + right results */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: Input */}
        <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 border-r border-border bg-card overflow-y-auto">
          <div className="p-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Sparkles className="h-3 w-3" />
              AI 驱动
            </div>

            <JDInput value={jdText} onChange={setJdText} disabled={isAnyLoading} />
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

            <p className="text-center text-xs text-muted-foreground">
              由 AI 驱动 · 你的隐私数据不会被存储
            </p>
          </div>
        </div>

        {/* Right panel: Tab content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {hasAnalyzed ? (
            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4 min-h-[50vh]">
                <PromptEditor
                  tab={activeTab}
                  value={prompts[activeTab]}
                  onChange={(v) => setPrompts((prev) => ({ ...prev, [activeTab]: v }))}
                  onRegenerate={() => runAnalysis(activeTab)}
                  disabled={loading[activeTab]}
                />
                <ResultPanel
                  tab={activeTab}
                  content={results[activeTab]}
                  isStreaming={loading[activeTab]}
                />
              </div>
            </div>
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
    </div>
  );
};

export default Index;
