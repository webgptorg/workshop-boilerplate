"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfiguration } from "./config";

let client: SupabaseClient | undefined;
export function browserSupabase() {
  if (!client) {
    const { url, publishableKey } = supabaseConfiguration();
    client = createClient(url, publishableKey, { auth: { detectSessionInUrl: false } });
  }
  return client;
}

export async function authenticatedFetch(url: string, options: RequestInit = {}, expectedUserId?: string) {
  const { data, error } = await browserSupabase().auth.getSession();
  if (error || !data.session || (expectedUserId && data.session.user.id !== expectedUserId)) throw new Error("Please sign in again.");
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${data.session.access_token}`);
  return fetch(url, { ...options, headers, cache: "no-store" });
}
