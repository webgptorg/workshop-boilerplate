import { useSyncExternalStore } from "react";

function subscribeToNothing(): () => void {
  return () => {};
}

/**
 * `false` on the server and during hydration, `true` once the component runs in the browser.
 *
 * Browser storage is only readable after hydration, so screens that depend on it wait for this flag.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}
