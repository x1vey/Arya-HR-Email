import { NextResponse } from "next/server";
import { generateEmailTemplate } from "@/lib/ai/generate-email";

export async function POST(req: Request) {
  try {
    const { prompt, apiKey } = (await req.json()) as {
      prompt?: string;
      apiKey?: string;
    };

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // API key can come from the request body (client-side key) or env
    const key = apiKey?.trim() || process.env.GEMINI_API_KEY;
    if (!key) {
      return NextResponse.json(
        {
          error:
            "No Gemini API key. Set GEMINI_API_KEY in .env.local or provide it in the AI settings.",
        },
        { status: 400 }
      );
    }

    const template = await generateEmailTemplate(prompt, key);
    return NextResponse.json({ template });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error generating email";
    console.error("[generate-email]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
