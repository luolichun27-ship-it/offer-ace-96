import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { jdText, resumeText, customPrompt, userPrompt, systemPrompt: sysOverride } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // New mode: caller supplies fully rendered userPrompt directly
    const useRaw = typeof userPrompt === "string" && userPrompt.trim().length > 0;

    if (!useRaw && (!jdText || jdText.trim().length === 0)) {
      return new Response(JSON.stringify({ error: "请输入内容" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = customPrompt || `你是一位资深的求职教练和招聘专家。你的任务是分析岗位JD（Job Description），并为求职者提供清晰、可操作的求职指南。

请用以下结构化格式输出分析结果（使用Markdown）：

## 🎯 岗位概要
简要总结这个岗位的核心定位、所属行业和级别。

## 📋 核心要求拆解
将JD中的要求分为「硬性要求」和「加分项」，逐条列出并解释其含义。

## 🔑 关键词提取
列出简历中必须包含的关键词和技能词汇（ATS友好）。

## 📝 简历优化建议
针对这个岗位，提供具体的简历调整建议。

## 💬 面试准备要点
预测可能的面试问题，并提供回答框架。

## 🎯 行动清单
列出3-5个立即可以开始的具体行动步骤。

请确保：
- 语言简洁有力，避免废话
- 建议要具体可执行，不要泛泛而谈
- 如果JD是英文的，分析结果用中文输出，但保留关键英文术语
- 如果提供了简历，请对比分析匹配度并给出针对性建议`;

    let userContent = `请分析以下岗位JD：\n\n${jdText}`;
    if (resumeText && resumeText.trim().length > 0) {
      userContent += `\n\n---\n\n以下是我的简历内容，请对比分析：\n\n${resumeText}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "请求过于频繁，请稍后再试" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI额度已用完，请充值" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI分析服务暂时不可用" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("analyze-jd error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "未知错误" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
