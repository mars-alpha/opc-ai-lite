// Secrets remain inside this child. stdout contains only validated analysis/config status.
import { callConfiguredChatJson, getConfiguredChatModelConfig } from '../../lib/server/ai/configured-chat.ts';
import { SYSTEM_PROMPT, PLAN_PROMPT, assertNoSecrets, validateAnalysis, classifyAiFailure } from './analysis.mjs';

let finishReason = '';
try {
  const config = getConfiguredChatModelConfig();
  if (!config || !/deepseek/i.test(config.provider + ' ' + config.model)) throw new Error('NOT_CONFIGURED');
  if (process.argv.includes('--config-only')) {
    process.stdout.write(JSON.stringify({ configured: true, model: config.model, provider: config.provider }));
  } else {
    let raw = '';
    for await (const chunk of process.stdin) { raw += chunk; if (raw.length > 110000) throw new Error('INPUT_TOO_LARGE'); }
    const input = JSON.parse(raw); assertNoSecrets(input, [config.apiKey]);
    const result = await callConfiguredChatJson({ systemPrompt: SYSTEM_PROMPT + PLAN_PROMPT, userPayload: input, maxOutputTokens: 32000, timeoutMs: 180000, temperature: 0.1 }, { fetchImpl: async (...args) => {
      const response = await fetch(...args);
      if (response.ok) { const payload = await response.clone().json(); finishReason = payload.choices?.[0]?.finish_reason || ''; }
      return response;
    } });
    assertNoSecrets(result.data, [config.apiKey]);
    const analysis = validateAnalysis(result.data, input);
    process.stdout.write(JSON.stringify({ analysis, model: config.model, provider: config.provider, usage: result.usage }));
  }
} catch (error) {
  process.stdout.write(JSON.stringify({ error: classifyAiFailure(error, finishReason) })); process.exitCode = 1;
}
