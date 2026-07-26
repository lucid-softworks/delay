import { invariant } from "@lucid-softworks/invariant";

export interface DelayOptions {
  readonly signal?: AbortSignal;
}

export class DelayAbortError extends Error {
  public override readonly name = "DelayAbortError";

  public constructor() {
    super("The delay was aborted");
  }
}

function abortReason(signal: AbortSignal): unknown {
  return signal.reason === undefined ? new DelayAbortError() : signal.reason;
}

/**
 * Resolves after `milliseconds`, or rejects when the optional signal aborts.
 */
export function delay(
  milliseconds: number,
  options: DelayOptions = {},
): Promise<void> {
  invariant(
    Number.isFinite(milliseconds) && milliseconds >= 0,
    "milliseconds must be a finite, non-negative number",
  );

  const { signal } = options;

  if (signal?.aborted) {
    return Promise.reject(abortReason(signal));
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(finish, milliseconds);

    function finish(): void {
      signal?.removeEventListener("abort", abort);
      resolve();
    }

    function abort(): void {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
      reject(abortReason(signal!));
    }

    signal?.addEventListener("abort", abort, { once: true });
  });
}
