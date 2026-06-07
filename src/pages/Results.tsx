import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PromptEditor } from "@/components/PromptEditor";
import { ResultPanel } from "@/components/ResultPanel";
import { DEFAULT_PROMPTS, TAB_CONFIG, type AnalysisTab } from "@/lib/default-prompts";
import { streamAnalysis } from "@/lib/stream-chat";
import { useToast } from "@/hooks/use-toast";

interface LocationState {
  jdText: string;
  resumeText?: string;
}

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const state = location.state as LocationState | null;

  const [activeTab, setActiveTab] = useState<AnalysisTab>("jdAnalysis");
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

  useEffect(() => {
    if (!state?.jdText) {
      navigate("/jd&offer", { replace: true });
      return;
    }
    // Auto-run all analyses on mount
    runAnalysis("jdAnalysis");
    runAnalysis("dailyWork");
    if (state.resumeText) {
      runAnalysis("resumeOptimize");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runAnalysis = useCallback(
    async (tab: AnalysisTab) => {
      if (!state?.jdText) return;

      if (tab === "resumeOptimize" && !state.resumeText) {
        toast({ title: "简历优化需要上传简历", variant: "destructive" });
        return;
      }

      setLoading((prev) => ({ ...prev, [tab]: true }));
      setResults((prev) => ({ ...prev, [tab]: "" }));

      let accumulated = "";

      try {
        await streamAnalysis({
          jdText: state.jdText,
          resumeText: tab === "resumeOptimize" ? state.resumeText : undefined,
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
    [state, prompts, toast]
  );

  const updatePrompt = (tab: AnalysisTab, value: string) => {
    setPrompts((prev) => ({ ...prev, [tab]: value }));
  };

  const isAnyLoading = loading.jdAnalysis || loading.dailyWork || loading.resumeOptimize;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="gradient-hero py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/jd&offer")}
            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h1 className="text-lg font-semibold text-primary-foreground font-display">
              岗位分析结果
            </h1>
          </div>
          <div className="w-20" />
        </div>
      </div>

      {/* Loading banner */}
      {isAnyLoading && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center gap-3 text-sm text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            {loading.jdAnalysis && "🧠 正在解析JD... "}
            {loading.dailyWork && "⏱ 正在生成工作日常... "}
            {loading.resumeOptimize && "✨ 正在优化简历... "}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as AnalysisTab)}
          className="flex flex-col h-full"
        >
          <TabsList className="w-fit mx-auto mb-6">
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

          {(Object.keys(TAB_CONFIG) as AnalysisTab[]).map((tab) => (
            <TabsContent key={tab} value={tab} className="flex-1 mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 min-h-[60vh]">
                <PromptEditor
                  tab={tab}
                  value={prompts[tab]}
                  onChange={(v) => updatePrompt(tab, v)}
                  onRegenerate={() => runAnalysis(tab)}
                  disabled={loading[tab]}
                />
                <ResultPanel
                  tab={tab}
                  content={results[tab]}
                  isStreaming={loading[tab]}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Results;
