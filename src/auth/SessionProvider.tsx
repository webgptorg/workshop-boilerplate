"use client";

import { spaceTrim } from "spacetrim";
import { UnexpectedError } from "@/errors";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { STORAGE_KEYS } from "@/storage/storageKeys";
import { useStoredValue } from "@/storage/useStoredValue";
import { authenticateUser } from "./authenticateUser";
import { MOCKED_USERS, type MockedUser } from "./mockedUsers";

interface SessionContextValue {
  readonly currentUser: MockedUser | null;
  readonly isHydrated: boolean;
  readonly login: (username: string, password: string) => MockedUser;
  readonly logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { readonly children: ReactNode }) {
  const { value: currentUserId, setValue: setCurrentUserId, isHydrated } = useStoredValue<string | null>(
    STORAGE_KEYS.session,
    null,
  );

  const currentUser = useMemo(
    () => MOCKED_USERS.find((user) => user.id === currentUserId) ?? null,
    [currentUserId],
  );

  const login = useCallback(
    (username: string, password: string) => {
      const user = authenticateUser(username, password);
      setCurrentUserId(user.id);
      return user;
    },
    [setCurrentUserId],
  );

  const logout = useCallback(() => setCurrentUserId(null), [setCurrentUserId]);

  const contextValue = useMemo(
    () => ({ currentUser, isHydrated, login, logout }),
    [currentUser, isHydrated, login, logout],
  );

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const contextValue = useContext(SessionContext);

  if (!contextValue) {
    throw new UnexpectedError(
      spaceTrim(`
        Hook \`useSession\` byl použit mimo \`SessionProvider\`.

        **Obalte** strom komponent providerem \`SessionProvider\`.
      `),
    );
  }

  return contextValue;
}
