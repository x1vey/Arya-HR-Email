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

    const p: AiProvider = provider === "groq" ? "groq" : "gemini";

    // Resolve key: request body → env var (provider-specific → generic)
    const key =
      apiKey?.trim() ||
      (p === "groq"
        ? process.env.GROQ_API_KEY
        : process.env.GEMINI_API_KEY);

    if (!key) {
      const envName = p === "groq" ? "GROQ_API_KEY" : "GEMINI_API_KEY";
      return NextResponse.json(
        {
          error: `No ${p === "groq" ? "Groq" : "Gemini"} API key. Set ${envName} in .env.local or provide it in the AI settings.`,
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
