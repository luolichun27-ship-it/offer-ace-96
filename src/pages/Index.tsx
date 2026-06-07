import { useCallback, useMemo, useState } from "react";
import { Search, Sparkles, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "@/components/TaskCard";
import {
  TASKS,
  SCENES,
  COUNTS,
  renderPrompt,
  type Scene,
  type TaskId,
} from "@/lib/expansion-tasks";
import { streamAnalysis } from "@/lib/stream-chat";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "油皮粉底液",
  "可乐鸡翅做法",
  "大码女装夏款",
  "户外露营攻略",
  "夏天脸上爱出油用什么护肤品",
];

type StateMap = Record<TaskId, string>;
type LoadingMap = Record<TaskId, boolean>;

const Index = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [scene, setScene] = useState<Scene>("shelf");
  const [count, setCount] = useState<(typeof COUNTS)[number]>(10);

  const initialPrompts = useMemo(() => {
    const map = {} as StateMap;
    for (const t of TASKS) map[t.id] = t.prompt;
    return map;
  }, []);
  const initialResults = useMemo(() => {
    const map = {} as StateMap;
    for (const t of TASKS) map[t.id] = "";
    return map;
  }, []);
  const initialLoading = useMemo(() => {
    const map = {} as LoadingMap;
    for (const t of TASKS) map[t.id] = false;
    return map;
  }, []);

  const [prompts, setPrompts] = useState<StateMap>(initialPrompts);
  const [results, setResults] = useState<StateMap>(initialResults);
  const [loading, setLoading] = useState<LoadingMap>(initialLoading);

  const isAnyLoading = Object.values(loading).some(Boolean);

  const runTask = useCallback(
    async (taskId: TaskId, queryOverride?: string) => {
      const q = (queryOverride ?? query).trim();
      if (!q) {
        toast({ title: "请先输入 Query", variant: "destructive" });
        return;
      }
      const template = prompts[taskId];
      const userPrompt = renderPrompt(template, { query: q, scene, count });

      setLoading((p) => ({ ...p, [taskId]: true }));
      setResults((p) => ({ ...p, [taskId]: "" }));

      let acc = "";
      try {
        await streamAnalysis({
          userPrompt,
          onDelta: (chunk) => {
            acc += chunk;
            setResults((p) => ({ ...p, [taskId]: acc }));
          },
          onDone: () => setLoading((p) => ({ ...p, [taskId]: false })),
          onError: (err) => {
            toast({ title: "生成失败", description: err, variant: "destructive" });
            setLoading((p) => ({ ...p, [taskId]: false }));
          },
        });
      } catch {
        toast({ title: "网络错误", description: "请检查网络后重试", variant: "destructive" });
        setLoading((p) => ({ ...p, [taskId]: false }));
      }
    },
    [query, scene, count, prompts, toast]
  );

  const handleGenerateAll = useCallback(() => {
    if (!query.trim()) {
      toast({ title: "请先输入 Query", variant: "destructive" });
      return;
    }
    TASKS.forEach((t) => runTask(t.id));
  }, [query, runTask, toast]);

  const useExample = (ex: string) => {
    setQuery(ex);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero / control bar */}
      <header className="border-b border-border bg-gradient-to-b from-secondary/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                AI Search Query Expansion Lab
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                抖音搜索策略 Demo · 关键词扩词 · 意图识别 · Sug 联想 · 排序策略
              </p>
            </div>
          </div>

          {/* Query input row */}
          <div className="rounded-2xl border border-border bg-card shadow-sm p-4 sm:p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Query
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="输入一个搜索词，如：油皮粉底液"
                  className="pl-9 h-11 text-base"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isAnyLoading) handleGenerateAll();
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-xs text-muted-foreground mr-1">示例：</span>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => useExample(ex)}
                    className="text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
              {/* Scene */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  搜索场景
                </label>
                <div className="flex gap-2">
                  {SCENES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setScene(s.value)}
                      className={cn(
                        "flex-1 px-3 py-2 rounded-lg border text-sm transition-colors text-left",
                        scene === s.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-foreground hover:border-primary/40"
                      )}
                    >
                      <div className="font-medium">{s.label}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {s.hint}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Count */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  拓展数量
                </label>
                <div className="flex gap-2">
                  {COUNTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCount(c)}
                      className={cn(
                        "flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                        count === c
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-foreground hover:border-primary/40"
                      )}
                    >
                      {c} 条
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="hero"
                size="lg"
                onClick={handleGenerateAll}
                disabled={!query.trim() || isAnyLoading}
                className="sm:w-auto w-full h-11"
              >
                <Rocket className="h-5 w-5" />
                {isAnyLoading ? "生成中…" : "开始生成"}
              </Button>
            </div>
          </div>

          {/* Progress badges */}
          {isAnyLoading && (
            <div className="flex flex-wrap gap-2">
              {TASKS.filter((t) => loading[t.id]).map((t) => (
                <Badge key={t.id} variant="secondary" className="gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  {t.title} 生成中
                </Badge>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Task grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {TASKS.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              prompt={prompts[task.id]}
              onPromptChange={(v) =>
                setPrompts((p) => ({ ...p, [task.id]: v }))
              }
              onReset={() =>
                setPrompts((p) => ({ ...p, [task.id]: task.prompt }))
              }
              onRegenerate={() => runTask(task.id)}
              output={results[task.id]}
              isStreaming={loading[task.id]}
              disabled={loading[task.id]}
            />
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          由 AI 驱动 · Prompt 修改后仅影响当前任务输出 · 任务之间互不影响
        </p>
      </main>
    </div>
  );
};

export default Index;
