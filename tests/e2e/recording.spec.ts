import { test, expect } from "./fixtures";
import { audioUpload } from "./audio";

const ANALYSIS = {
  summary: "The team agreed to **share interview notes**.",
  todos: [{ title: "Share interview notes", description: "Send notes to the team.", dueDate: "2030-12-15" }],
};
const TRANSCRIPT = "Jamie: Share the interview notes on Friday.";

test("one dashboard click starts a single recording; pause, resume, and save a take", async ({ app, page }) => {
  expect(await app.microphoneRequests()).toBe(0);
  await app.main.getByRole("button", { name: "Start recording", exact: true }).click();
  await expect(page).toHaveURL(/\/meetings\/[^/]+\/studio$/);
  await expect(app.main.getByRole("button", { name: "Stop recording", exact: true })).toBeVisible();
  expect(await app.microphoneRequests()).toBe(1);
  await expect(app.main.locator(".recorder-time")).not.toHaveText("00:00");
  await app.main.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(app.main.getByText("PAUSED", { exact: true })).toBeVisible();
  await app.main.getByRole("button", { name: "Resume", exact: true }).click();
  await app.main.getByRole("button", { name: "Stop recording", exact: true }).click();
  await expect(app.main.getByRole("link", { name: "Download recording" })).toBeVisible();
  await page.reload();
  await expect(app.main.getByRole("button", { name: "Record another take", exact: true })).toBeEnabled();
  await expect(app.main.getByRole("button", { name: "Stop recording", exact: true })).toHaveCount(0);
  expect(await app.microphoneRequests()).toBe(1);
  await expect(app.main.locator("audio")).toHaveAttribute("src", /^blob:/);
});

test("opening or reloading a studio never requests microphone access", async ({ app, page }) => {
  await app.createMeeting("Quiet studio", false);
  await expect(page).toHaveURL(/\/studio$/);
  await expect(app.main.getByRole("button", { name: "Start recording", exact: true })).toBeEnabled();
  expect(await app.microphoneRequests()).toBe(0);
  await page.reload();
  await expect(app.main.getByRole("button", { name: "Start recording", exact: true })).toBeEnabled();
  expect(await app.microphoneRequests()).toBe(0);
});

test("denied microphone access leaves the instant meeting available for retry", async ({ app, page }) => {
  await page.evaluate(() => {
    navigator.mediaDevices.getUserMedia = async () => { throw new DOMException("Permission denied", "NotAllowedError"); };
  });
  await app.main.getByRole("button", { name: "Start recording", exact: true }).click();
  await expect(page).toHaveURL(/\/studio$/);
  await expect(app.main.getByRole("alert")).toContainText("Microphone access was denied.");
  await expect(app.main.getByRole("button", { name: "Start recording", exact: true })).toBeEnabled();
  await page.reload();
  await expect(app.main.getByRole("button", { name: "Start recording", exact: true })).toBeEnabled();
  expect(await app.microphoneRequests()).toBe(0);
});

test("upload, download, persist, and remove audio; reject invalid and empty files", async ({ app, page }) => {
  await app.createMeeting("Uploaded interview", false);
  const INPUT = app.main.locator('input[type="file"]');
  const AUDIO = audioUpload();
  await INPUT.setInputFiles(AUDIO);
  await expect(app.main.getByRole("link", { name: "Download recording" })).toBeVisible();
  await page.reload();
  await expect(app.main.getByText(AUDIO.name, { exact: true })).toBeVisible();
  const DOWNLOAD_PROMISE = page.waitForEvent("download");
  await app.main.getByRole("link", { name: "Download recording" }).click();
  const DOWNLOAD = await DOWNLOAD_PROMISE;
  expect(DOWNLOAD.suggestedFilename()).toBe(AUDIO.name);
  const STREAM = await DOWNLOAD.createReadStream();
  const CHUNKS: Buffer[] = [];
  for await (const CHUNK of STREAM) CHUNKS.push(Buffer.from(CHUNK));
  expect(Buffer.concat(CHUNKS)).toEqual(AUDIO.buffer);
  await app.main.getByRole("button", { name: "Remove recording" }).click();
  await app.dialog.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(app.main.getByRole("link", { name: "Download recording" })).toHaveCount(0);
  await INPUT.setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("Not audio") });
  await expect(app.main.getByRole("alert")).toContainText("Choose an MP3");
  await INPUT.setInputFiles({ ...AUDIO, buffer: Buffer.alloc(0) });
  await expect(app.main.getByRole("alert")).toContainText("between 1 byte and 25 MB");
  await expect(app.main.getByRole("button", { name: "Finish meeting", exact: true })).toBeDisabled();
  await page.reload();
  await expect(app.main.getByRole("button", { name: "Finish meeting", exact: true })).toBeDisabled();
  await expect(app.main.locator("audio")).toHaveCount(0);
});

test("finishing uploaded audio creates a transcript, summary, and linked todos without duplicates", async ({ app, page }) => {
  let transcriptionRequestCount = 0;
  let analysisRequestCount = 0;
  await page.route("**/api/transcribe", async (route) => {
    transcriptionRequestCount += 1;
    expect(route.request().method()).toBe("POST");
    expect(route.request().postDataBuffer()?.toString()).toContain('filename="interview.wav"');
    await route.fulfill({ json: { text: TRANSCRIPT } });
  });
  await page.route("**/api/analyze", async (route) => {
    analysisRequestCount += 1;
    expect(route.request().postDataJSON()).toMatchObject({ text: TRANSCRIPT, language: "en" });
    await route.fulfill({ json: ANALYSIS });
  });
  await app.createMeeting("Processed interview", false);
  const STUDIO_URL = page.url();
  await app.main.locator('input[type="file"]').setInputFiles(audioUpload());
  await app.main.getByRole("button", { name: "Finish meeting", exact: true }).click();
  await expect(page).not.toHaveURL(/\/studio$/);
  await expect(app.main.getByText("Completed", { exact: true })).toBeVisible();
  await expect(app.main.getByRole("link", { name: ANALYSIS.todos[0].title, exact: true })).toBeVisible();
  await expect(app.main.locator("strong").filter({ hasText: /^share interview notes$/ })).toBeVisible();
  await app.main.getByRole("button", { name: "Transcript", exact: true }).click();
  await expect(app.main.getByText(TRANSCRIPT, { exact: true })).toBeVisible();
  await app.main.getByRole("button", { name: "Generate summary & todos", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Meeting ready.");
  expect(transcriptionRequestCount).toBe(1);
  expect(analysisRequestCount).toBe(1);
  await app.open(new URL(STUDIO_URL).pathname);
  await app.main.locator('input[type="file"]').setInputFiles(audioUpload());
  await page.route("**/api/analyze", async (route) => {
    analysisRequestCount += 1;
    expect(route.request().postDataJSON().text).toBe(`${TRANSCRIPT}\n\n${TRANSCRIPT}`);
    await route.fulfill({ json: ANALYSIS });
  });
  await app.main.getByRole("button", { name: "Finish meeting", exact: true }).click();
  await expect(page).not.toHaveURL(/\/studio$/);
  await app.main.getByRole("button", { name: /^Todos/ }).click();
  await expect(app.main.getByRole("link", { name: ANALYSIS.todos[0].title, exact: true })).toHaveCount(1);
  expect(transcriptionRequestCount).toBe(2);
  expect(analysisRequestCount).toBe(2);
});

test("an analysis failure preserves transcription and retry reuses it", async ({ app, page }) => {
  let transcriptionRequestCount = 0;
  await page.route("**/api/transcribe", async (route) => {
    transcriptionRequestCount += 1;
    await route.fulfill({ json: { text: TRANSCRIPT } });
  });
  await app.createMeeting("Retry interview", false);
  await app.main.locator('input[type="file"]').setInputFiles(audioUpload());
  await app.main.getByRole("button", { name: "Finish meeting", exact: true }).click();
  await expect(app.main.getByRole("alert")).toContainText("Automatic transcription needs an API connection.");
  await page.reload();
  await expect(app.main.getByRole("button", { name: "Finish meeting", exact: true })).toBeEnabled();
  await page.route("**/api/analyze", (route) => route.fulfill({ json: ANALYSIS }));
  await app.main.getByRole("button", { name: "Finish meeting", exact: true }).click();
  await expect(page).not.toHaveURL(/\/studio$/);
  await app.main.getByRole("button", { name: "Transcript", exact: true }).click();
  await expect(app.main.getByText(TRANSCRIPT, { exact: true })).toBeVisible();
  expect(transcriptionRequestCount).toBe(1);
});
