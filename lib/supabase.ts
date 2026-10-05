"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfiguration } from "./supabase-configuration";

let client: SupabaseClient | null = null;

export function getSupabase() {
  const CONFIGURATION = getSupabaseConfiguration();
  client ??= createClient(CONFIGURATION.url, CONFIGURATION.publishableKey);
  return client;
}

export async function authenticatedFetch(url: string, options: RequestInit) {
  const { data } = await getSupabase().auth.getSession();
  const HEADERS = new Headers(options.headers);
  if (data.session) HEADERS.set("Authorization", `Bearer ${data.session.access_token}`);
  return fetch(url, { ...options, headers: HEADERS });
}

export async function registerWithoutEmail(email: string, password: string, name: string) {
  const CONFIGURATION = getSupabaseConfiguration();
  // Fail before signup if the hosted project would send a confirmation email.
  const RESPONSE = await fetch(`${CONFIGURATION.url}/auth/v1/settings`, {
    headers: { apikey: CONFIGURATION.publishableKey }, cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!RESPONSE.ok) throw new Error("Could not check registration settings. Please try again.");
  const SETTINGS: unknown = await RESPONSE.json();
  if (!SETTINGS || typeof SETTINGS !== "object" || !("mailer_autoconfirm" in SETTINGS) || SETTINGS.mailer_autoconfirm !== true)
    throw new Error("Registration requires disabling Confirm email in the Supabase project's Auth settings. No email was sent.");
  const { data, error } = await getSupabase().auth.signUp({ email, password, options: { data: { name } } });
  if (error) throw new Error("Could not create an account. Try another email or retry later.");
  if (!data.session) throw new Error("Could not start a session. Check the project's Auth configuration.");
  return data.session;
}
