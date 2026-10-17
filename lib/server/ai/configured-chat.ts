import "server-only";

export type ConfiguredChatModelConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  provider: string;
  thinkingControl?: "enable_thinking" | "thinking" | "reasoning_effort";
};

type ChatInput = {
  systemPrompt: string;
  userPayload: unknown;
  temperature?: number;
  timeoutMs?: number;
  maxOutputTokens?: number;
  thinking?: "disabled";
  signal?: AbortSignal;
};

type ChatDependencies = {
  config?: ConfiguredChatModelConfig;
  fetchImpl?: typeof fetch;
  onAttempt?: () => Promise<void>;
  onUsage?: (usage: ChatUsage) => Promise<void>;
};

export type ChatUsage={status:"REPORTED"|"UNKNOWN";inputTokens:number|null;outputTokens:number|null;totalTokens:number|null;cachedInputTokens:number|null;reasoningTokens:number|null};
const count=(value:unknown)=>typeof value==="number" && Number.isSafeInteger(value) && value>=0?value:null;
export function readChatUsage(value:unknown):ChatUsage{
 const u=value && typeof value==="object"?value as Record<string,any>:{};
 const inputTokens=count(u.prompt_tokens),outputTokens=count(u.completion_tokens),totalTokens=count(u.total_tokens);
 return {status:inputTokens!==null || outputTokens!==null || totalTokens!==null?"REPORTED":"UNKNOWN",inputTokens,outputTokens,totalTokens,cachedInputTokens:count(u.prompt_tokens_details?.cached_tokens),reasoningTokens:count(u.completion_tokens_details?.reasoning_tokens)};
}

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

  const control=process.env.OPC_AI_ANALYSIS_THINKING_CONTROL;
  const thinkingControl=control==="enable_thinking" || control==="thinking" || control==="reasoning_effort"?control:undefined;
  return { baseUrl, apiKey, model, provider,...(thinkingControl?{thinkingControl}:{}) };
}

export async function callConfiguredChatJson(
  input: ChatInput,
  dependencies: ChatDependencies = {}
) {
  const config = dependencies.config ?? getConfiguredChatModelConfig();
  if (!config) throw new Error("AI_ANALYSIS_NOT_CONFIGURED");
  if(input.thinking && !config.thinkingControl)throw new Error("AI_THINKING_CONTROL_UNCONFIGURED");
  if(input.maxOutputTokens!==undefined && (!Number.isSafeInteger(input.maxOutputTokens) || input.maxOutputTokens<1 || input.maxOutputTokens>32000))throw new Error("AI_OUTPUT_LIMIT_INVALID");
  input.signal?.throwIfAborted();

  const fetchImpl = dependencies.fetchImpl ?? fetch;
  await dependencies.onAttempt?.();
  const response = await fetchImpl(config.baseUrl + "/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + config.apiKey
    },
    body: JSON.stringify({
      model: config.model,
      temperature: input.temperature ?? 0.1,
      ...(input.maxOutputTokens!==undefined?{max_tokens:input.maxOutputTokens}:{}),
      ...(input.thinking?config.thinkingControl==="enable_thinking"?{enable_thinking:false}:config.thinkingControl==="thinking"?{thinking:{type:"disabled"}}:{reasoning_effort:"none"}:{}),
      messages: [
        { role: "system", content: input.systemPrompt },
        { role: "user", content: JSON.stringify(input.userPayload) }
      ]
    }),
    signal: input.signal?AbortSignal.any([input.signal,AbortSignal.timeout(input.timeoutMs??45000)]):AbortSignal.timeout(input.timeoutMs ?? 45000)
  });

  if (!response.ok) throw new Error("AI_ANALYSIS_PROVIDER_FAILED");
  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: unknown;
  };
  const usage=readChatUsage(payload.usage);
  await dependencies.onUsage?.(usage);
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI_ANALYSIS_EMPTY");

  return {
    config,
    data: extractJson(content),
    usage
  };
}
