const PARTICIPANT_ALIASES: Array<[RegExp, string]> = [
  [/\b(openai|chatgpt)\b/i, "OpenAI"],
  [/\b(anthropic|claude)\b/i, "Anthropic"],
  [/\bgoogle\s*deepmind\b|\bdeepmind\b/i, "Google DeepMind"],
  [/\bgoogle\s+ai\b/i, "Google AI"],
  [/\bmicrosoft\b/i, "Microsoft"],
  [/\bgithub\b/i, "GitHub"],
  [/\bnvidia\b/i, "NVIDIA"],
  [/\bmistral(?:\s+ai)?\b/i, "Mistral AI"],
  [/\bhugging\s*face\b/i, "Hugging Face"],
  [/\b(qwen|通义千问|阿里云.*通义)\b/i, "Qwen"],
  [/\b(meta\s+ai|meta)\b/i, "Meta"],
  [/\b(xai|x\.ai|grok)\b/i, "xAI"],
  [/\bamazon\s+web\s+services\b|\baws\b/i, "AWS"]
];

export function canonicalHotParticipantName(value: string) {
  const normalized = value.normalize("NFKC").replace(/\s+/g, " ").trim();
  for (const [pattern, canonical] of PARTICIPANT_ALIASES) {
    if (pattern.test(normalized)) return canonical;
  }
  return normalized;
}
