"use client";

import { getSupabase } from "../supabase";
import { isAppState } from "../validation";
import { createAccountState, type Account } from "../account-state";
import type { AppState } from "../types";

export interface SavedAccountState { state: AppState; revision: number; isPending: boolean }

export async function loadAccountState(account: Account): Promise<SavedAccountState> {
  const { data, error } = await getSupabase().from("AppData").select("data,revision").eq("userId", account.id).maybeSingle();
  if (error) throw error;
  if (data) {
    if (!isAppState(data.data) || data.data.user.id !== account.id) throw new Error("Invalid saved workspace. Contact support before restoring a backup.");
    return { state: { ...data.data, user: { ...data.data.user, email: account.email } }, revision: data.revision, isPending: false };
  }
  const { data: profile, error: profileError } = await getSupabase().from("User").select("name,language,theme").eq("id", account.id).single();
  if (profileError) throw profileError;
  const STATE = createAccountState({ ...account, name: profile.name });
  STATE.user.language = profile.language;
  STATE.user.theme = profile.theme;
  return { state: STATE, revision: 0, isPending: true };
}

export async function saveAccountState(state: AppState, revision: number) {
  const { data, error } = await getSupabase().rpc("saveAppData", { state, expectedRevision: revision });
  if (error) throw error;
  if (typeof data !== "number") throw new Error("Invalid save response.");
  return data;
}
