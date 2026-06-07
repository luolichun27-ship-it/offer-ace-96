export type TaskId =
  | "rewrite"
  | "expansion"
  | "longtail"
  | "intent"
  | "ranking"
  | "sug"
  | "risk";

export interface TaskDef {
  id: TaskId;
  title: string;
  subtitle: string;
  icon: string;
  prompt: string;
}

export const SCENES = [
  { value: "content", label: "内容场", hint: "教程 / 攻略 / 测评 / 经验" },
  { value: "shelf", label: "货架场", hint: "商品 / 品牌 / 款式 / 价格" },
] as const;

export type Scene = (typeof SCENES)[number]["value"];

export const COUNTS = [5, 10, 15] as const;

export const TASKS: TaskDef[] = [
  {
    id: "rewrite",
    title: "Task 1 · 同义改写",
    subtitle: "Query Rewrite · 精确召回",
    icon: "🔁",
    prompt: `你是搜索同义词改写专家。

目标：
对 Query 进行强相关改写，用于精确召回。

要求：
- 保持核心实体不变
- 保持搜索意图不变
- 改写后必须能够互相替换
- 输出 {{count}} 条

场景：{{scene}}
Query：{{query}}

输出格式：
直接输出改写后的词，每行一个，不要编号，不要解释。`,
  },
  {
    id: "expansion",
    title: "Task 2 · 语义扩词",
    subtitle: "Query Expansion · 扩大召回",
    icon: "🌐",
    prompt: `你是搜索召回策略专家。

目标：
围绕 Query 扩展相关搜索词，扩大召回范围。

要求：
- 覆盖潜在需求
- 覆盖商品属性
- 覆盖内容需求
- 覆盖场景需求
- 输出 {{count}} 条

场景：{{scene}}
Query：{{query}}

输出格式：
直接输出扩展后的词，每行一个，不要编号，不要解释。`,
  },
  {
    id: "longtail",
    title: "Task 3 · 长尾问句拓展",
    subtitle: "Long-tail Query · 模拟真实用户",
    icon: "💬",
    prompt: `你是抖音搜索 Query 挖掘专家。

目标：
模拟真实用户搜索行为，生成口语化长尾问句。

要求：
- 自然口语化
- 符合真实搜索习惯
- 用于长尾召回与 Sug 推荐
- 输出 {{count}} 条

场景：{{scene}}
Query：{{query}}

输出格式：
直接输出问句，每行一个，不要编号，不要解释。`,
  },
  {
    id: "intent",
    title: "Task 4 · 意图分类",
    subtitle: "Query Understanding · 意图识别",
    icon: "🎯",
    prompt: `你是搜索意图识别模型。

意图体系：
内容意图 | 消费意图 | 服务意图 | 娱乐意图 | 信息意图

分析 Query：{{query}}
场景上下文：{{scene}}

请严格按以下 Markdown 格式输出：
- **一级意图**：xxx
- **二级意图**：xxx
- **搜索场景**：xxx
- **置信度**：xx%
- **判断依据**：一句话说明`,
  },
  {
    id: "ranking",
    title: "Task 5 · 排序策略推荐",
    subtitle: "Ranking Strategy · 召回后排序",
    icon: "📊",
    prompt: `你是搜索排序策略专家。

根据 Query 和场景推荐排序策略权重链路。

可选策略：
相关性排序 / CTR 排序 / CVR 排序 / 销量排序 / 评分排序 / 内容热度排序 / 时效性排序

规则：
- 消费意图：优先商品类策略
- 内容意图：优先内容热度/时效性

场景：{{scene}}
Query：{{query}}

输出格式：
输出推荐的策略组合（5 条），按优先级排列，格式为：
1. 策略名 —— 一句话说明
2. 策略名 —— 一句话说明
...`,
  },
  {
    id: "sug",
    title: "Task 6 · Sug 联想推荐",
    subtitle: "Query Suggest · 提升点击率",
    icon: "✨",
    prompt: `你是搜索 Sug 推荐系统。

目标：
生成最容易被用户点击的联想词。

要求：
- 贴合 {{query}} 的搜索习惯
- 词长适中，便于点击
- 输出 {{count}} 条

场景：{{scene}}
Query：{{query}}

输出格式：
直接输出联想词，每行一个，不要编号，不要解释。`,
  },
  {
    id: "risk",
    title: "Task 7 · 风控过滤",
    subtitle: "Risk Control · 过滤低质词",
    icon: "🛡️",
    prompt: `你是搜索风控策略模型。

围绕 Query「{{query}}」模拟一批可能出现的扩词，并识别其中的：
广告词 / 违规词 / 低质词 / 营销词 / 作弊词

请按以下 Markdown 格式输出：

### ✅ 保留词
- 词1
- 词2
- 词3

### ❌ 过滤词
- 词1 —— 过滤原因（广告词 / 违规词 / 低质词 / 营销词）
- 词2 —— 过滤原因
- 词3 —— 过滤原因`,
  },
];

export function renderPrompt(
  template: string,
  vars: { query: string; scene: string; count: number }
) {
  const sceneLabel =
    SCENES.find((s) => s.value === vars.scene)?.label ?? vars.scene;
  return template
    .replaceAll("{{query}}", vars.query)
    .replaceAll("{{scene}}", sceneLabel)
    .replaceAll("{{count}}", String(vars.count));
}
