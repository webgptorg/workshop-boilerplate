import { readFile } from "node:fs/promises";
import { test as base, expect, type Download, type Page } from "@playwright/test";
import { mockSupabase } from "./supabase-fixture";
import { DEFAULT_WORKSPACE } from "../../lib/seed";
import type { AppState } from "../../lib/types";

const WORKSPACE_URL = `/${DEFAULT_WORKSPACE}`;
const MICROPHONE_REQUESTS_KEY = "minute.e2e.microphone-requests";

export async function readDownload(download: Download) {
  const PATH = await download.path();
  if (!PATH) throw new Error("The browser did not save the download.");
  return readFile(PATH, "utf8");
}

export class MinutePage {
  constructor(readonly page: Page) {}

  get main() { return this.page.getByRole("main"); }
  get dialog() { return this.page.getByRole("dialog"); }

  async open(path = WORKSPACE_URL) {
    await this.page.goto(path);
    await expect(this.main.getByRole("heading", { level: 1 })).toBeVisible();
  }

  async createMeeting(title: string, isScheduled = true) {
    await this.open(`${WORKSPACE_URL}/meetings`);
    await this.main.getByRole("button", { name: isScheduled ? "Schedule" : "New meeting", exact: true }).click();
    await this.dialog.getByLabel("Meeting title").fill(title);
    await this.dialog.getByRole("button", { name: isScheduled ? "Schedule meeting" : "Open meeting studio", exact: true }).click();
    await expect(this.main.getByRole("heading", { name: title, exact: true })).toBeVisible();
    return this.page.url();
  }

  async createTodo(title: string) {
    await this.open(`${WORKSPACE_URL}/todos`);
    await this.main.getByRole("button", { name: "New todo", exact: true }).click();
    await this.dialog.getByLabel("Title", { exact: true }).fill(title);
    await this.dialog.getByRole("button", { name: "Create todo", exact: true }).click();
    await this.main.getByRole("link", { name: title, exact: true }).click();
    await expect(this.main.getByRole("heading", { name: title, exact: true })).toBeVisible();
  }

  async exportBackup(): Promise<AppState> {
    await this.open(`${WORKSPACE_URL}/settings`);
    const PENDING_DOWNLOAD = this.page.waitForEvent("download");
    await this.main.getByRole("button", { name: "Export data", exact: true }).click();
    return JSON.parse(await readDownload(await PENDING_DOWNLOAD)) as AppState;
  }

  async importBackup(data: unknown) {
    await this.main.locator('input[type="file"]').setInputFiles({
      name: "minute-backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(data)),
    });
  }

  async microphoneRequests() {
    return this.page.evaluate((key) => Number(sessionStorage.getItem(key) ?? 0), MICROPHONE_REQUESTS_KEY);
  }
}

export const test = base.extend<{ app: MinutePage; authentication: void }>({
  authentication: [async ({ context }, provideFixture) => {
    const DATABASE = await mockSupabase(context);
    try { await provideFixture(); } finally { await DATABASE.close(); }
  }, { auto: true }],
  app: async ({ page, context }, provideFixture) => {
    // Keep browser interaction real while isolating paid AI calls and optional live captions.
    await context.route("**/api/**", (route) => route.fulfill({
      status: 503, json: { error: "not_configured" },
    }));
    await context.addInitScript((key) => {
      Object.defineProperty(window, "SpeechRecognition", { value: undefined, configurable: true });
      Object.defineProperty(window, "webkitSpeechRecognition", { value: undefined, configurable: true });
      // A synthetic input avoids dependence on OS audio devices. MediaRecorder stays native.
      navigator.mediaDevices.getUserMedia = async () => {
        sessionStorage.setItem(key, String(Number(sessionStorage.getItem(key) ?? 0) + 1));
        const AUDIO_CONTEXT = new AudioContext();
        const DESTINATION = AUDIO_CONTEXT.createMediaStreamDestination();
        const OSCILLATOR = AUDIO_CONTEXT.createOscillator();
        OSCILLATOR.connect(DESTINATION);
        OSCILLATOR.start();
        await AUDIO_CONTEXT.resume();
        DESTINATION.stream.getTracks().forEach((track) => {
          const STOP_TRACK = track.stop.bind(track);
          track.stop = () => {
            STOP_TRACK();
            if (AUDIO_CONTEXT.state !== "closed") {
              OSCILLATOR.stop();
              void AUDIO_CONTEXT.close();
            }
          };
        });
        return DESTINATION.stream;
      };
    }, MICROPHONE_REQUESTS_KEY);
    const APP = new MinutePage(page);
    await page.goto("/");
    await login(page);
    await APP.open();
    await provideFixture(APP);
  },
});

export { expect, WORKSPACE_URL };

export async function login(page: Page, email = "test@ptbk.io", password = "password123") {
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.locator(".sidebar")).toBeVisible();
}
