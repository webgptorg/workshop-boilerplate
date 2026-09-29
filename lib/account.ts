import type { AppState } from "./types";

export interface AccountIdentity { id: string; email?: string }

export function bindAccount(state: AppState, user: AccountIdentity): AppState {
  return {
    ...state,
    user: { ...state.user, id: user.id, email: user.email ?? "" },
    memberships: state.memberships.map((membership) => ({ ...membership, userId: user.id })),
  };
}

export function createAccountState(user: AccountIdentity): AppState {
  const workspaceId = "my-workspace";
  return {
    version: 1,
    user: { id: user.id, email: user.email ?? "", name: user.email?.split("@")[0] || "My account", language: "en", theme: "system" },
    workspaces: [{ id: workspaceId, name: "My workspace", description: "", languages: ["en"], color: "cyan", createdAt: new Date().toISOString() }],
    memberships: [{ userId: user.id, workspaceId, role: "owner" }],
    meetings: [], todos: [], onboardingDismissed: false,
  };
}
