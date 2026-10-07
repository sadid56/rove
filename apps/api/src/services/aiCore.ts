import { AI_PROVIDER, AI_MODEL, GEMINI_API_KEY, GEMINI_MODEL, OPENAI_API_KEY, OPENAI_MODEL } from "@repo/config";
import type { PageDiagnosisInput, PageAiAnalysis, ScanAiSummary } from "@repo/database";

export type AiProvider = "gemini" | "openai";

export interface AiConfig {
  provider: AiProvider;
  model: string;
  temperature: number;
}

export const aiConfig: AiConfig = {
  provider: (AI_PROVIDER as AiProvider) || "gemini",
  model: AI_MODEL || "gemini-3.5-flash-lite", // e.g. "gemini-3.5-flash-lite", "gpt-4o-mini", "gpt-4o"
  temperature: 0.2,
};

export interface AiCallOptions {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  jsonMode?: boolean;
  provider?: AiProvider;
}

export interface AiChatInput {
  prompt: string;
  context?: string;
  systemPrompt?: string;
}

export interface AiChatResult {
  reply: string;
  provider: AiProvider;
  model: string;
  timestamp: string;
}

async function callGemini(options: AiCallOptions): Promise<string> {
  const apiKey = GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("[aiCore] GEMINI_API_KEY is not configured.");
  }

  const rawModel = (options.model || aiConfig.model || GEMINI_MODEL || "gemini-3.5-flash-lite").trim();
  const modelName = rawModel.startsWith("models/") ? rawModel.replace("models/", "") : rawModel;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const parts: Array<{ text: string }> = [];
  if (options.systemPrompt) {
    parts.push({ text: `System Instructions:\n${options.systemPrompt}\n` });
  }
  parts.push({ text: options.prompt });

  const payload: Record<string, unknown> = {
    contents: [
      {
        role: "user",
        parts,
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? aiConfig.temperature,
      ...(options.jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`[aiCore:Gemini] API returned ${res.status}: ${errorText}`);
  }

  const data = (await res.json()) as any;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("[aiCore:Gemini] No candidate content returned.");
  }
  return text;
}

async function callOpenAi(options: AiCallOptions): Promise<string> {
  const apiKey = OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("[aiCore] OPENAI_API_KEY is not configured.");
  }

  const modelName = (options.model || aiConfig.model || OPENAI_MODEL || "gpt-4o-mini").trim();
  const url = "https://api.openai.com/v1/chat/completions";

  const messages: Array<{ role: "system" | "user"; content: string }> = [];
  if (options.systemPrompt) {
    messages.push({ role: "system", content: options.systemPrompt });
  }
  messages.push({ role: "user", content: options.prompt });

  const payload: Record<string, unknown> = {
    model: modelName,
    messages,
    temperature: options.temperature ?? aiConfig.temperature,
    ...(options.jsonMode ? { response_format: { type: "json_object" } } : {}),
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`[aiCore:OpenAI] API returned ${res.status}: ${errorText}`);
  }

  const data = (await res.json()) as any;
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("[aiCore:OpenAI] No response content returned.");
  }
  return content;
}

// ---------------------------------------------------------------------------
// Unified aiCore Engine
// ---------------------------------------------------------------------------
export const aiCore = {
  /**
   * Current active configuration
   */
  config: aiConfig,

  /**
   * Change model or provider programmatically at runtime
   */
  setModel(model: string) {
    aiConfig.model = model;
  },

  setProvider(provider: AiProvider, model?: string) {
    aiConfig.provider = provider;
    if (model) {
      aiConfig.model = model;
    } else if (provider === "openai" && aiConfig.model.includes("gemini")) {
      aiConfig.model = "gpt-4o-mini";
    } else if (provider === "gemini" && aiConfig.model.includes("gpt")) {
      aiConfig.model = "gemini-3.5-flash-lite";
    }
  },

  /**
   * Unified text generation across active AI model
   */
  async generate(options: AiCallOptions): Promise<string> {
    const provider = options.provider || aiConfig.provider;
    if (provider === "openai") {
      return callOpenAi(options);
    }
    return callGemini(options);
  },

  /**
   * Unified JSON generation across active AI model
   */
  async generateJson<T = unknown>(options: AiCallOptions): Promise<T> {
    const raw = await this.generate({ ...options, jsonMode: true });
    let clean = raw.trim();

    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (clean.startsWith("```")) {
      clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    return JSON.parse(clean) as T;
  },

  /**
   * Unified AI Chat Assistant for engineering triage
   */
  async chat(input: AiChatInput): Promise<AiChatResult> {
    const systemPrompt =
      input.systemPrompt ||
      `You are ROVE, an elite autonomous Web QA Intelligence diagnostic engine.
Your mission is to help engineers triage test failures, latency spikes, React hydration errors, and security issues.
Answer concisely, technically, and actionably.
${input.context ? `\nTelemetry Context:\n${input.context}` : ""}`;

    try {
      const reply = await this.generate({
        prompt: input.prompt,
        systemPrompt,
      });

      return {
        reply,
        provider: aiConfig.provider,
        model: aiConfig.model,
        timestamp: "Just now",
      };
    } catch {
      // Graceful fallback if offline or no API key
      const fallbackReply = input.context
        ? `[ROVE Offline Telemetry (${aiConfig.provider}:${aiConfig.model})]: For query "${input.prompt}": Telemetry indicates ${input.context}. Assert zero unhandled promise rejections and inspect network traces.`
        : `[ROVE Offline Diagnostics]: For "${input.prompt}": Review active scan inspector tabs and console errors.`;

      return {
        reply: fallbackReply,
        provider: aiConfig.provider,
        model: aiConfig.model,
        timestamp: "Just now",
      };
    }
  },

  /**
   * Autonomous Page QA Diagnosis
   */
  async diagnosePage(input: PageDiagnosisInput): Promise<PageAiAnalysis> {
    const promptContext = {
      route: input.routePath,
      status: input.httpStatus,
      healthReasons: input.healthReasons,
      consoleErrors: input.consoleEvents
        ?.filter((c) => c.type === "error")
        .map((c) => ({
          message: c.message,
          location: c.location,
        })),
      runtimeErrors: input.runtimeErrors?.map((r) => ({
        type: r.errorType,
        message: r.message,
        stack: r.stack?.slice(0, 300),
      })),
      failedNetwork: input.networkRequests
        ?.filter((n) => n.failed)
        .map((n) => ({
          url: n.url,
          method: n.method,
          status: n.status,
          reason: n.failureReason,
        })),
    };

    const systemPrompt = `You are an elite autonomous Web QA engineer and diagnostic agent for production web apps.
Analyze the following test failure data collected from headless Chromium browser execution.
Provide a structured JSON output with the exact keys:
- severity: "critical" | "warning" | "info"
- rootCause: string (1-2 sentences identifying root cause)
- summary: string (clear explanation of why this happened)
- impact: string (what happens to end users)
- suggestedFixes: string[] (actionable step-by-step developer advice)
- codePatch: string (clean, copy-pasteable TypeScript/React code solution)
- detectedCategories: string[] (e.g. ["hydration", "network", "runtime"])

Respond ONLY with valid JSON. Do not wrap in markdown quotes if possible, or wrap in \`\`\`json.`;

    const parsed = await this.generateJson<any>({
      prompt: `Data:\n${JSON.stringify(promptContext, null, 2)}`,
      systemPrompt,
      temperature: 0.2,
    });

    return {
      status: "analyzed",
      severity: parsed.severity || "warning",
      rootCause: parsed.rootCause || "Issue detected",
      summary: parsed.summary || "",
      impact: parsed.impact || "",
      suggestedFixes: parsed.suggestedFixes || [],
      codePatch: parsed.codePatch,
      detectedCategories: parsed.detectedCategories || [],
      analyzedAt: new Date().toISOString(),
    };
  },
};
