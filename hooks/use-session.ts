import { useCallback } from "react";
import {
  authenticateUser,
  endSession,
  findUserById,
  sessionStore,
  startSession,
  type User,
} from "@/lib/users";
import { useIsHydrated } from "./use-is-hydrated";
import { useStoreValue } from "./use-store-value";

export type SessionState = {
  readonly isHydrated: boolean;
  readonly currentUser: User | null;
  /**
   * @throws {AuthenticationError} when the credentials are wrong
   */
  readonly login: (username: string, password: string) => User;
  readonly logout: () => void;
};

export function useSession(): SessionState {
  const isHydrated = useIsHydrated();
  const session = useStoreValue(sessionStore);
  const currentUser = session === null ? null : findUserById(session.userId);

  const login = useCallback((username: string, password: string) => {
    const user = authenticateUser(username, password);
    startSession(user.id);
    return user;
  }, []);

  const logout = useCallback(() => {
    endSession();
  }, []);

  return { isHydrated, currentUser, login, logout };
}
