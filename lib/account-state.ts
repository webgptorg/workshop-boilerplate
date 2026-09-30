import { createInitialState } from "./seed";
import type { AppState, User } from "./types";

export function bindAccountIdentity(state: AppState, identity: Pick<User, "id" | "email">): AppState {
  return {
    ...state,
    user: { ...state.user, id: identity.id, email: identity.email },
    memberships: state.memberships.map((membership) => ({ ...membership, userId: identity.id })),
  };
}

export function createAccountState(identity: Pick<User, "id" | "email" | "name">): AppState {
  const state = bindAccountIdentity(createInitialState(), identity);
  state.user.name = identity.name;
  // Keep the tutorial for the fixture; new accounts start with an empty personal workspace.
  if (identity.email !== "test@ptbk.io") {
    state.meetings = [];
    state.todos = [];
  }
  return state;
}
