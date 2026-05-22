import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { generateEmailTemplate, type AiProvider } from "@/lib/ai/generate-email";
import { checkRateLimit } from "@/lib/rate-limit";

/** Per-account daily generation limit */
const DAILY_LIMIT = 25;

export async function POST(req: Request) {
  try {
    /* ── Identify caller ── */
    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      hdrs.get("x-real-ip") ??
      "anonymous";

    /* ── Rate limit ── */
    const rl = checkRateLimit(`gen:${ip}`, DAILY_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: `Daily limit reached (${DAILY_LIMIT} generations/day). Resets in ${Math.ceil(rl.resetMs / 60000)} minutes.`,
          quota: { remaining: 0, limit: rl.limit },
        },
        { status: 429 }
      );
    }

    /* ── Parse body ── */
    const { prompt, apiKey, provider, contextFiles } = (await req.json()) as {
      prompt?: string;
      apiKey?: string;
      provider?: AiProvider;
      contextFiles?: { name: string; content: string }[];
    };

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const validProviders = ["gemini", "groq", "openrouter"] as const;
    const p: AiProvider = validProviders.includes(provider as AiProvider)
      ? (provider as AiProvider)
      : "gemini";

    // Resolve key: request body -> env var (provider-specific)
    const envMap: Record<AiProvider, string | undefined> = {
      gemini: process.env.GEMINI_API_KEY,
      groq: process.env.GROQ_API_KEY,
      openrouter: process.env.OPENROUTER_API_KEY,
    };
    const labelMap: Record<AiProvider, string> = {
      gemini: "Gemini",
      groq: "Groq",
      openrouter: "OpenRouter",
    };
    const envNameMap: Record<AiProvider, string> = {
      gemini: "GEMINI_API_KEY",
      groq: "GROQ_API_KEY",
      openrouter: "OPENROUTER_API_KEY",
    };

    const key = apiKey?.trim() || envMap[p];

    if (!key) {
      return NextResponse.json(
        {
          error: `No ${labelMap[p]} API key. Set ${envNameMap[p]} in .env.local or provide it in the AI settings.`,
        },
        { status: 400 }
      );
    }

    /* ── Build full prompt with context files ── */
    let fullPrompt = prompt.trim();

    if (contextFiles && contextFiles.length > 0) {
      const ctx = contextFiles
        .map((f) => `### ${f.name}\n${f.content}`)
        .join("\n\n");
      fullPrompt = `## Design context (always follow these rules):\n${ctx}\n\n## Email request:\n${fullPrompt}`;
    }

    const template = await generateEmailTemplate(fullPrompt, key, p);

    return NextResponse.json({
      template,
      quota: { remaining: rl.remaining, limit: rl.limit },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error generating email";
    console.error("[generate-email]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
