/**
 * Delivers a webhook payload, retrying when the subscriber does not answer.
 */
export type DeliveryResult = { ok: boolean; status: number | null; attempts: number };

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function deliverWithRetry(url: string, payload: unknown): Promise<DeliveryResult> {
  let lastStatus: number | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      lastStatus = response.status;
      if (response.ok) return { ok: true, status: response.status, attempts: attempt };
    } catch {
      lastStatus = null;
    }

    if (attempt < MAX_ATTEMPTS) await sleep(RETRY_DELAY_MS);
  }

  return { ok: false, status: lastStatus, attempts: MAX_ATTEMPTS };
}
