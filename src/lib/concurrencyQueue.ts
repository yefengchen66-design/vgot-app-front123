export type QueueTaskStatus = "queued" | "running" | "success" | "failed" | "canceled";

export type QueueTask<T> = {
  id: string;
  label?: string;
  status: QueueTaskStatus;
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
  error?: string;
  result?: T;
  // Cancel token to support best-effort cancellation.
  abortController?: AbortController;
};

export type EnqueueOptions = {
  label?: string;
};

export type RunFn<T> = (ctx: { signal: AbortSignal }) => Promise<T>;

/**
 * Tiny per-key concurrency queue.
 * - Separate queues via `key`.
 * - Enforces max parallel `limit` per key.
 * - Preserves FIFO order.
 */
export class ConcurrencyQueue {
  private limits = new Map<string, number>();
  private runningCount = new Map<string, number>();
  private pending = new Map<string, Array<() => void>>();

  setLimit(key: string, limit: number) {
    this.limits.set(key, Math.max(1, Math.floor(limit || 1)));
    this.drain(key);
  }

  getLimit(key: string) {
    return this.limits.get(key) ?? 1;
  }

  getRunningCount(key: string) {
    return this.runningCount.get(key) ?? 0;
  }

  getPendingCount(key: string) {
    return (this.pending.get(key) ?? []).length;
  }

  /** Enqueue a task and run when capacity is available. Returns an abort that works for queued or running tasks. */
  enqueue<T>(key: string, run: RunFn<T>): { promise: Promise<T>; abort: () => void } {
    const ac = new AbortController();

    type PendingItem = {
      id: string;
      fn: () => void;
    };

    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    let started = false;

    const promise = new Promise<T>((resolve, reject) => {
      const start = () => {
        if (ac.signal.aborted) {
          reject(new DOMException("Aborted", "AbortError"));
          return;
        }
        started = true;
        this.incRunning(key);
        run({ signal: ac.signal })
          .then(resolve)
          .catch(reject)
          .finally(() => {
            this.decRunning(key);
            this.drain(key);
          });
      };

      const limit = this.getLimit(key);
      const running = this.getRunningCount(key);
      if (running < limit) {
        start();
        return;
      }

      const list = (this.pending.get(key) ?? []) as unknown as PendingItem[];
      list.push({ id, fn: start });
      this.pending.set(key, list as unknown as Array<() => void>);
    });

    const abort = () => {
      ac.abort();
      if (!started) {
        const list = (this.pending.get(key) ?? []) as unknown as PendingItem[];
        const next = list.filter((item) => item.id !== id);
        this.pending.set(key, next as unknown as Array<() => void>);
      }
    };

    return { promise, abort };
  }

  private incRunning(key: string) {
    this.runningCount.set(key, (this.runningCount.get(key) ?? 0) + 1);
  }
  private decRunning(key: string) {
    this.runningCount.set(key, Math.max(0, (this.runningCount.get(key) ?? 0) - 1));
  }

  private drain(key: string) {
    const raw = this.pending.get(key) ?? [];
    if (!raw.length) return;

    // Stored as PendingItem[] but typed as Array<() => void> to keep private field simple.
    const list = raw as unknown as Array<{ id: string; fn: () => void }>;
    const limit = this.getLimit(key);
    while (this.getRunningCount(key) < limit && list.length) {
      const item = list.shift();
      if (item?.fn) item.fn();
    }
    this.pending.set(key, list as unknown as Array<() => void>);
  }
}

// A shared singleton is fine for this app (single page), but can also be instantiated per view.
export const hypersellQueue = new ConcurrencyQueue();
