"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database-types";
import { getSupabaseConfig } from "./config";

let client: SupabaseClient<Database> | undefined;

export function getBrowserSupabase() {
  if (!client) {
    const { url, publishableKey } = getSupabaseConfig();
    client = createClient<Database>(url, publishableKey);
  }
  return client;
}

export async function authenticatedFetch(input: string, options: RequestInit = {}, expectedUserId?: string) {
  const { data, error } = await getBrowserSupabase().auth.getSession();
  if (error || !data.session) throw new Error("Your session has expired. Sign in again.");
  if (expectedUserId && data.session.user.id !== expectedUserId) throw new Error("The signed-in account changed. Reload before continuing.");
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${data.session.access_token}`);
  return fetch(input, { ...options, headers, cache: "no-store" });
}
