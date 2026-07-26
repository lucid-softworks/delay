import { afterEach, describe, expect, it, vi } from "vitest";

import { delay, DelayAbortError } from "../src/index.js";

describe("delay", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves after the requested duration", async () => {
    vi.useFakeTimers();
    const promise = delay(25);
    let settled = false;
    void promise.then(() => {
      settled = true;
    });

    await vi.advanceTimersByTimeAsync(24);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toBeUndefined();
  });

  it("rejects immediately when the signal is already aborted", async () => {
    const controller = new AbortController();
    const reason = new Error("stop");
    controller.abort(reason);

    await expect(delay(10, { signal: controller.signal })).rejects.toBe(reason);
  });

  it("cancels an active delay", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const promise = delay(100, { signal: controller.signal });

    controller.abort("cancelled");

    await expect(promise).rejects.toBe("cancelled");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("uses a stable fallback error when no abort reason is exposed", async () => {
    const controller = new AbortController();
    Object.defineProperty(controller.signal, "reason", { value: undefined });
    controller.abort();

    await expect(
      delay(10, { signal: controller.signal }),
    ).rejects.toBeInstanceOf(DelayAbortError);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects the invalid duration %s",
    (milliseconds) => {
      expect(() => delay(milliseconds)).toThrow(
        "milliseconds must be a finite, non-negative number",
      );
    },
  );
});
