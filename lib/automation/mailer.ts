import type { Contact } from "./types";

/**
 * The Mailer is the pluggable "send" boundary. The engine renders the final
 * HTML and hands it here; swapping transports (mock log, the POC's
 * /api/send-test route, or a real Gmail/Graph transport later) means
 * implementing this one interface.
 */
export interface SendInput {
  to: string;
  subject: string;
  html: string;
  templateId: string;
  contact: Contact;
}

export interface SendResult {
  messageId: string;
  provider: string;
}

export interface Mailer {
  send(input: SendInput): Promise<SendResult>;
}

/**
 * Logs each send to the console instead of delivering. Ideal for the demo
 * script and tests. Pass a `now` provider so logs can show the engine's
 * (possibly virtual) clock rather than wall-clock time.
 */
export class ConsoleMailer implements Mailer {
  constructor(private readonly now: () => number = Date.now) {}

  async send(input: SendInput): Promise<SendResult> {
    const stamp = new Date(this.now()).toISOString().replace("T", " ").slice(0, 16);
    console.log(
      `  ✉  [${stamp}]  →  ${input.to.padEnd(26)}  "${input.subject}"  ` +
        `(${input.templateId}, ${input.html.length} chars)`
    );
    return {
      provider: "console",
      messageId: `console_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    };
  }
}

/**
 * Records every send in memory instead of delivering. Used by the visual
 * builder's "Test run" so the UI can show what would have gone out.
 */
export class CollectingMailer implements Mailer {
  readonly sent: SendInput[] = [];

  async send(input: SendInput): Promise<SendResult> {
    this.sent.push(input);
    return {
      provider: "preview",
      messageId: `preview_${this.sent.length}`
    };
  }
}

/**
 * Posts to the POC's mock send route (or any compatible endpoint). Use this
 * to drive real HTTP sends through the existing /api/send-test contract.
 */
export class HttpMailer implements Mailer {
  constructor(private readonly baseUrl: string = "http://localhost:3000") {}

  async send(input: SendInput): Promise<SendResult> {
    const res = await fetch(`${this.baseUrl}/api/send-test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template_id: input.templateId,
        subject: input.subject,
        to: input.to,
        html: input.html
      })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Mailer HTTP ${res.status}: ${text}`);
    }
    const data = (await res.json()) as { message_id?: string; provider?: string };
    return {
      provider: data.provider ?? "http",
      messageId: data.message_id ?? `http_${Date.now()}`
    };
  }
}
