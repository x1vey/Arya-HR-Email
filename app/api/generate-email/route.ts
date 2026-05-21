import { NextResponse } from "next/server";
import { generateEmailTemplate, type AiProvider } from "@/lib/ai/generate-email";

export async function POST(req: Request) {
  try {
    const { prompt, apiKey, provider } = (await req.json()) as {
      prompt?: string;
      apiKey?: string;
      provider?: AiProvider;
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

    // Resolve key: request body → env var (provider-specific)
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

    const template = await generateEmailTemplate(prompt, key, p);
    return NextResponse.json({ template });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error generating email";
    console.error("[generate-email]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
