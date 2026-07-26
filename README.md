# @lucid-softworks/delay

Wait for a non-negative duration, with optional `AbortSignal` cancellation.

```ts
import { delay } from "@lucid-softworks/delay";

const controller = new AbortController();
await delay(250, { signal: controller.signal });
```

If cancellation has no platform-provided reason, the promise rejects with a
`DelayAbortError`. Invalid durations throw synchronously.
