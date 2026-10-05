import { createInitialState } from "./seed";
import type { AppState } from "./types";

export interface Account { id: string; email: string; name: string }

export function bindStateToAccount(state: AppState, account: Account): AppState {
  return {
    ...state, user: { ...state.user, id: account.id, email: account.email },
    memberships: state.memberships.map((membership) => ({ ...membership, userId: account.id })),
  };
}

export function createAccountState(account: Account) {
  const STATE = bindStateToAccount(createInitialState(), account);
  STATE.user.name = account.name;
  return STATE;
}

export function areAppStatesEqual(first: AppState, second: AppState) {
  const serialize = (state: AppState) => JSON.stringify(state, (_key, value: unknown) =>
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.fromEntries(Object.entries(value).sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey)))
      : value,
  );
  return serialize(first) === serialize(second);
}
