"use client";

import { useEffect } from "react";

type WakeLockSentinelLike = {
  release: () => Promise<void>;
};

export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) {
      return;
    }
    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const wl = (navigator as Navigator & {
          wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> };
        }).wakeLock;
        if (!wl || cancelled) return;
        sentinel = await wl.request("screen");
      } catch {
        // Ignore if battery saver or permissions block wake lock
      }
    };

    void acquire();

    const onVisibility = () => {
      if (document.visibilityState === "visible" && !cancelled) {
        void acquire();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void sentinel?.release().catch(() => {});
    };
  }, [active]);
}
