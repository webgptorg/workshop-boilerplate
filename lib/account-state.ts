import { createInitialState } from "./seed";
import type { AppState, User } from "./types";

export function createAccountState(user: User): AppState {
  const workspaceId = crypto.randomUUID();
  const initial = createInitialState();
  return {
    ...initial,
    user,
    workspaces: [{ ...initial.workspaces[0], id: workspaceId, createdAt: new Date().toISOString() }],
    memberships: [{ userId: user.id, workspaceId, role: "owner" }],
    meetings: [],
    todos: [],
  };
}

export function bindAccount(state: AppState, user: User): AppState {
  return {
    ...state,
    user,
    memberships: state.memberships.map((membership) => ({ ...membership, userId: user.id })),
  };
}
