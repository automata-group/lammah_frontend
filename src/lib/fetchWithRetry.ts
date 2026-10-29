export interface RetryOptions {
  retries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Selective Network & Transient Server Retry.
 * Strictly prevents retrying on client-side or terminal errors (400, 401, 403, 422).
 * Only retries on genuine physical network drops (TypeError / Failed to fetch)
 * and transient gateway hiccups (502, 503, 504, 429).
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options: RetryOptions = {}
): Promise<Response> {
  const {
    retries = 2,
    initialDelayMs = 600,
    maxDelayMs = 3000,
    onRetry,
  } = options;

  let lastError: any = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(input, init);

      // Terminal client errors (do NOT retry on auth/quota/validation failures)
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
        return response;
      }

      // Transient Gateway errors
      if ([502, 503, 504, 429].includes(response.status)) {
        if (attempt === retries) return response;
        throw new Error(`Transient Server Error HTTP ${response.status}`);
      }

      return response;
    } catch (err: any) {
      lastError = err;
      if (attempt >= retries) break;

      const delay = Math.min(maxDelayMs, initialDelayMs * Math.pow(2, attempt)) + Math.random() * 200;
      if (onRetry) {
        onRetry(attempt + 1, err);
      }
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  throw lastError;
}
