import { Link } from "react-router-dom";
import { Briefcase, Search, ArrowRight, Sparkles } from "lucide-react";

const CARDS = [
  {
    to: "/jd&offer",
    title: "JD & Offer 分析",
    subtitle: "把看不懂的 JD 变成拿 offer 的指南",
    desc: "粘贴岗位 JD、上传简历，自动生成 JD 解读、工作日常拆解与简历优化建议。",
    icon: Briefcase,
    accent: "from-primary/20 to-primary/5",
  },
  {
    to: "/expansion",
    title: "AI Search Query Expansion Lab",
    subtitle: "搜索策略 Demo · 关键词扩词 · 意图识别",
    desc: "基于一个 Query 实时生成同义改写、语义扩词、长尾问句、意图分类、排序策略、Sug 联想与风控过滤。",
    icon: Search,
    accent: "from-accent/20 to-accent/5",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-to-b from-secondary/30 to-background">
        <div className="max-w-5xl mx-auto px-6 py-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Rubby's Lab
            </h1>
            <p className="text-sm text-muted-foreground">
              选择一个工具开始 · Choose a workspace
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.to}
                to={c.to}
                className={`group relative rounded-2xl border border-border bg-gradient-to-br ${c.accent} p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all`}
              >
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-background/80 border border-border flex items-center justify-center text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-foreground">
                      {c.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.subtitle}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-sm text-muted-foreground/90 mt-4 leading-relaxed">
                  {c.desc}
                </p>
                <div className="mt-4 text-xs font-mono text-muted-foreground/70">
                  {c.to}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Home;
