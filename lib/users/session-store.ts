import { createLocalStorageStore } from "../storage";

export type Session = {
  readonly userId: string;
  readonly loggedInAt: string;
};

export const sessionStore = createLocalStorageStore<Session | null>({
  name: "session",
  version: 1,
  defaultValue: null,
});

export function startSession(userId: string): void {
  sessionStore.write({ userId, loggedInAt: new Date().toISOString() });
}

export function endSession(): void {
  sessionStore.reset();
}
