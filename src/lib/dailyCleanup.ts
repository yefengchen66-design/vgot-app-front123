export type DailyCleanupOptions = {
  /** Storage key used to persist HyperSell tasks */
  storageKey: string;
  /** Called when a cleanup should clear in-memory state */
  onClear: () => void;
  /** Optional: inject a clock for tests */
  now?: () => Date;
  /** Optional: inject setTimeout for tests */
  setTimeoutFn?: (fn: () => void, ms: number) => any;
  /** Optional: inject clearTimeout for tests */
  clearTimeoutFn?: (id: any) => void;
  /** Optional: inject storage for tests */
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
};

const LAST_CLEANUP_KEY_SUFFIX = ':lastMidnightCleanup';

export function getNextLocalMidnightMs(now: Date): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0); // next day 00:00 local
  return next.getTime() - now.getTime();
}

export function shouldRunCleanup(lastRunIso: string | null, now: Date): boolean {
  if (!lastRunIso) return true;
  const last = new Date(lastRunIso);
  if (Number.isNaN(last.getTime())) return true;
  // If last run is before today's midnight boundary, run again
  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 0, 0, 0);
  return last.getTime() < todayMidnight.getTime();
}

/**
 * Schedules & performs a daily cleanup at local midnight.
 *
 * - Clears the persisted HyperSell tasks list (storageKey)
 * - Calls onClear() to clear in-memory UI state
 * - Persists a "last cleanup" timestamp to avoid re-clearing on reloads the same day
 */
export function setupDailyMidnightCleanup(opts: DailyCleanupOptions) {
  const storage = opts.storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  const nowFn = opts.now ?? (() => new Date());
  const setTimeoutFn = opts.setTimeoutFn ?? setTimeout;
  const clearTimeoutFn = opts.clearTimeoutFn ?? clearTimeout;

  if (!storage) {
    return { dispose: () => {} };
  }

  const lastKey = `${opts.storageKey}${LAST_CLEANUP_KEY_SUFFIX}`;
  let timeoutId: any = null;

  const run = () => {
    try {
      storage.removeItem(opts.storageKey);
      opts.onClear();
      storage.setItem(lastKey, nowFn().toISOString());
    } catch {
      // ignore storage errors
    }
  };

  // Run once on mount if we've crossed midnight since last run
  try {
    const last = storage.getItem(lastKey);
    if (shouldRunCleanup(last, nowFn())) {
      // Only clear if there's actually something to clear OR no last run
      // (cheap check: storageKey exists)
      const hasTasks = !!storage.getItem(opts.storageKey);
      if (hasTasks || !last) run();
    }
  } catch {
    // ignore
  }

  const scheduleNext = () => {
    const ms = getNextLocalMidnightMs(nowFn());
    timeoutId = setTimeoutFn(() => {
      run();
      scheduleNext();
    }, ms);
  };

  scheduleNext();

  return {
    dispose: () => {
      if (timeoutId != null) {
        clearTimeoutFn(timeoutId);
      }
    },
  };
}
