import "server-only";

export async function measureServerTask<T>(label: string, task: () => Promise<T>): Promise<T> {
  const startedAt = performance.now();
  try {
    return await task();
  } finally {
    const duration = performance.now() - startedAt;
    if (process.env.NODE_ENV !== "production" || duration >= 150) {
      console.info(`[OPC PERF] ${label}: ${duration.toFixed(1)}ms`);
    }
  }
}
