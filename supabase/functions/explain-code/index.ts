const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MAX_CODE_LENGTH = 8000;
const LANGUAGES = ["javascript", "python", "html"];
const GEMINI_MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT = `You are a senior software engineer and patient teacher. Explain the code the user sends.
Respond in clean Markdown with EXACTLY these four top-level sections, in this order, using these exact headings:

## 💡 Concept Overview
A short summary of what the code does, followed by a simple line-by-line (or block-by-block) breakdown.

## ⏱️ Time & Space Complexity
Big-O time and space complexity with a brief justification. If complexity does not apply (e.g. HTML/CSS markup), say so and describe the rendering cost instead.

## 🐛 Potential Bugs or Edge Cases
A bulleted list of realistic bugs, pitfalls, or edge cases, each with a short explanation of when it occurs.

## 🚀 Optimization / Better Alternative Approach
Suggest a better or more idiomatic alternative, with a short code snippet in a fenced code block, and explain the trade-off.

Keep the tone friendly and precise. Do not wrap the whole answer in a code block.`;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return jsonResponse({ error: "AI service is not configured" }, 500);
    }

    const payload = await req.json().catch(() => null);
    const code = typeof payload?.code === "string" ? payload.code.trim() : "";
    const language = typeof payload?.language === "string" ? payload.language : "";

    if (!code) {
      return jsonResponse({ error: "Please provide some code to explain." }, 400);
    }
    if (code.length > MAX_CODE_LENGTH) {
      return jsonResponse({ error: `Code must be ${MAX_CODE_LENGTH} characters or fewer.` }, 400);
    }
    if (!LANGUAGES.includes(language)) {
      return jsonResponse({ error: "Unsupported language." }, 400);
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              role: "user",
              parts: [{ text: `Language: ${language}\n\n\`\`\`${language}\n${code}\n\`\`\`` }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      },
    );

    if (!geminiResponse.ok) {
      console.error("Gemini request failed", geminiResponse.status, await geminiResponse.text());
      return jsonResponse({ error: "The AI service could not process this request. Please try again." }, 502);
    }

    const data = await geminiResponse.json();
    const explanation = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("")
      .trim();

    if (!explanation) {
      return jsonResponse({ error: "The AI returned an empty explanation. Please try again." }, 502);
    }

    return jsonResponse({ explanation });
  } catch (err) {
    console.error("explain-code failed", err);
    return jsonResponse({ error: "Something went wrong while generating the explanation." }, 500);
  }
});
