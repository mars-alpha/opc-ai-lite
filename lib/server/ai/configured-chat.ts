import "server-only";

export type ConfiguredChatModelConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  provider: string;
};

type ChatInput = {
  systemPrompt: string;
  userPayload: unknown;
  temperature?: number;
};

type ChatDependencies = {
  config?: ConfiguredChatModelConfig;
  fetchImpl?: typeof fetch;
};

function extractJson(content: string) {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {}

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI_ANALYSIS_INVALID_JSON");
  return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
}

export function getConfiguredChatModelConfig(): ConfiguredChatModelConfig | null {
  const baseUrl = (process.env.OPC_AI_ANALYSIS_BASE_URL ?? "").trim().replace(/\/$/, "");
  const apiKey = (process.env.OPC_AI_ANALYSIS_API_KEY ?? "").trim();
  const model = (process.env.OPC_AI_ANALYSIS_MODEL ?? "").trim();
  const providerEnv = (process.env.OPC_AI_ANALYSIS_PROVIDER ?? "").trim();

  if (!baseUrl || !apiKey || !model) return null;

  let provider = providerEnv;
  if (!provider) {
    try {
      provider = new URL(baseUrl).hostname;
    } catch {
      provider = "OPENAI_COMPATIBLE";
    }
  }

  return { baseUrl, apiKey, model, provider };
}

export async function callConfiguredChatJson(
  input: ChatInput,
  dependencies: ChatDependencies = {}
) {
  const config = dependencies.config ?? getConfiguredChatModelConfig();
  if (!config) throw new Error("AI_ANALYSIS_NOT_CONFIGURED");

  const fetchImpl = dependencies.fetchImpl ?? fetch;
  const response = await fetchImpl(config.baseUrl + "/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + config.apiKey
    },
    body: JSON.stringify({
      model: config.model,
      temperature: input.temperature ?? 0.1,
      messages: [
        { role: "system", content: input.systemPrompt },
        { role: "user", content: JSON.stringify(input.userPayload) }
      ]
    }),
    signal: AbortSignal.timeout(45000)
  });

  if (!response.ok) throw new Error("AI_ANALYSIS_PROVIDER_FAILED");
  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI_ANALYSIS_EMPTY");

  return {
    config,
    data: extractJson(content)
  };
}
