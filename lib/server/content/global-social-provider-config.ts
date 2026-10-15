import "server-only";

export type GlobalSocialProvider = "YOUTUBE_AI_TREND";

export function assertGlobalSocialProviderConfiguration(
  providers: readonly GlobalSocialProvider[],
  env: Record<string, string | undefined>,
  relayConfigured: boolean
) {
  if (
    providers.includes("YOUTUBE_AI_TREND") &&
    !env.YOUTUBE_DATA_API_KEY?.trim() &&
    !relayConfigured
  ) {
    throw new Error("YOUTUBE_PROVIDER_CONFIGURATION_REQUIRED");
  }
}
