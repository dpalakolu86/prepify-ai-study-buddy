import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const body = await req.json();
    const { type } = body;

    if (type === "chat") {
      return handleChat(body, LOVABLE_API_KEY);
    } else if (type === "ap-quiz") {
      return handleAPQuiz(body, LOVABLE_API_KEY);
    } else if (type === "normal-quiz") {
      return handleNormalQuiz(body, LOVABLE_API_KEY);
    } else if (type === "convert") {
      return handleConvert(body, LOVABLE_API_KEY);
    } else {
      return new Response(JSON.stringify({ error: "Unknown type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("ai-study error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleChat(body: any, apiKey: string) {
  const { messages } = body;
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content: `You are Prepify AI, a friendly and knowledgeable study tutor. You help students understand topics clearly, generate practice questions, and prepare for exams. 
          - Explain concepts in simple, easy-to-understand language
          - Use examples, analogies, and step-by-step breakdowns
          - When asked to generate questions, create varied and challenging ones
          - Be encouraging and supportive
          - Use markdown formatting for clarity (headers, bullet points, bold)`,
        },
        ...messages,
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    throw new Error(`AI gateway error: ${status}`);
  }

  return new Response(response.body, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

async function handleAPQuiz(body: any, apiKey: string) {
  const { subject, count = 5 } = body;
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content: "You generate realistic AP exam practice questions. Always return valid JSON.",
        },
        {
          role: "user",
          content: `Generate ${count} AP-style multiple choice questions for ${subject}. Each question must have exactly 5 answer choices (A-E) like a real AP exam. Include at least one stimulus-based question with a short passage or quote.

Return ONLY a JSON object in this exact format:
{"questions":[{"question":"...","stimulus":"optional passage or null","choices":["choice A","choice B","choice C","choice D","choice E"],"correct":0,"explanation":"..."}]}

The "correct" field is the 0-based index of the correct answer.`,
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "return_questions",
          description: "Return AP quiz questions",
          parameters: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    stimulus: { type: "string" },
                    choices: { type: "array", items: { type: "string" } },
                    correct: { type: "integer" },
                    explanation: { type: "string" },
                  },
                  required: ["question", "choices", "correct", "explanation"],
                },
              },
            },
            required: ["questions"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "return_questions" } },
    }),
  });

  if (!response.ok) {
    if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    throw new Error(`AI error: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  const args = JSON.parse(toolCall?.function?.arguments || "{}");

  return new Response(JSON.stringify(args), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleNormalQuiz(body: any, apiKey: string) {
  const { subject, topic, count = 5 } = body;
  const topicStr = topic ? ` specifically about "${topic}"` : "";
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You generate study quiz questions. Always return valid JSON." },
        {
          role: "user",
          content: `Generate ${count} multiple choice questions for ${subject}${topicStr}. Each question must have exactly 4 answer choices (A-D).

Return ONLY a JSON object: {"questions":[{"question":"...","choices":["A","B","C","D"],"correct":0,"explanation":"..."}]}`,
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "return_questions",
          description: "Return quiz questions",
          parameters: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    choices: { type: "array", items: { type: "string" } },
                    correct: { type: "integer" },
                    explanation: { type: "string" },
                  },
                  required: ["question", "choices", "correct", "explanation"],
                },
              },
            },
            required: ["questions"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "return_questions" } },
    }),
  });

  if (!response.ok) {
    if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    throw new Error(`AI error: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  const args = JSON.parse(toolCall?.function?.arguments || "{}");

  return new Response(JSON.stringify(args), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleConvert(body: any, apiKey: string) {
  const { content, sourceType, title } = body;

  const prompt = sourceType === "youtube"
    ? `This is a YouTube video URL: ${content}. Based on the video topic implied by the URL, generate comprehensive study materials including a summary, flashcards, and quiz questions about the likely topic.`
    : `Convert the following study notes/content into comprehensive study materials:\n\n${content}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You convert study content into structured study materials. Return valid JSON." },
        {
          role: "user",
          content: `${prompt}

Title: "${title}"

Generate:
1. A detailed summary in markdown format
2. 8-12 flashcards (front/back pairs)
3. 5 quiz questions with 4 choices each`,
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "return_materials",
          description: "Return converted study materials",
          parameters: {
            type: "object",
            properties: {
              summary: { type: "string", description: "Markdown formatted summary" },
              flashcards: {
                type: "array",
                items: {
                  type: "object",
                  properties: { front: { type: "string" }, back: { type: "string" } },
                  required: ["front", "back"],
                },
              },
              quiz: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    choices: { type: "array", items: { type: "string" } },
                    correct: { type: "integer" },
                    explanation: { type: "string" },
                  },
                  required: ["question", "choices", "correct", "explanation"],
                },
              },
            },
            required: ["summary", "flashcards", "quiz"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "return_materials" } },
    }),
  });

  if (!response.ok) {
    if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    throw new Error(`AI error: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  const args = JSON.parse(toolCall?.function?.arguments || "{}");

  return new Response(JSON.stringify(args), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
