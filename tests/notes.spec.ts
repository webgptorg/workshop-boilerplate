import { test, expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

async function nameUser(page: Page, name: string) {
  await page.getByRole("button", { name: "Edit your name" }).click();
  await page.getByRole("textbox", { name: "Your name" }).fill(name);
  await page.getByRole("button", { name: "Make yourself at home" }).click();
}

async function noteText(page: Page) {
  // Cursor labels are editor decorations, not part of the note itself.
  return page.getByRole("textbox", { name: "Note content" }).evaluate((node) =>
    Array.from(node.querySelectorAll(".cm-line"), (line) => {
      const copy = line.cloneNode(true) as HTMLElement;
      copy
        .querySelectorAll(".cm-ySelectionCaret, .cm-placeholder")
        .forEach((cursor) => cursor.remove());
      return copy.textContent ?? "";
    }).join("\n"),
  );
}

test("two visitors share titles, text, cursors, presence, and concurrent offline edits", async ({
  browser,
  baseURL,
}) => {
  const first = await browser.newContext();
  const second = await browser.newContext();
  const alex = await first.newPage();
  const sam = await second.newPage();
  const link = `${baseURL}/?room=${randomUUID()}`;
  await alex.goto(link);
  await sam.goto(link);
  const alexEditor = alex.getByRole("textbox", { name: "Note content" });
  const samEditor = sam.getByRole("textbox", { name: "Note content" });
  await expect(alexEditor).toBeVisible();
  await expect(samEditor).toBeVisible();
  await nameUser(alex, "Alex");
  await nameUser(sam, "Sam");
  await expect(
    alex.locator(".participant-name").filter({ hasText: "Sam" }),
  ).toBeVisible();
  await expect(
    sam.locator(".participant-name").filter({ hasText: "Alex" }),
  ).toBeVisible();
  await alex
    .getByRole("textbox", { name: "Note title", exact: true })
    .fill("Our shared ideas");
  await expect(
    sam.getByRole("textbox", { name: "Note title", exact: true }),
  ).toHaveValue("Our shared ideas");
  await alex.bringToFront();
  await alexEditor.click();
  await alex.keyboard.insertText("A thought from both of us.");
  await expect(samEditor).toContainText("A thought from both of us.");
  await expect(
    sam.locator(".cm-ySelectionInfo").filter({ hasText: "Alex" }),
  ).toBeVisible();
  await expect(alex.getByText("All changes saved")).toBeVisible();

  await second.setOffline(true);
  await alexEditor.click();
  await alex.keyboard.press("ControlOrMeta+End");
  await alex.keyboard.insertText(" Alex’s addition.");
  await expect(alex.getByText("All changes saved")).toBeVisible();
  await sam.bringToFront();
  await samEditor.click();
  await sam.keyboard.press("ControlOrMeta+End");
  await sam.keyboard.insertText(" Sam’s addition.");
  await expect(sam.getByText("Waiting to sync", { exact: true })).toBeVisible();
  await second.setOffline(false);
  await expect(alexEditor).toContainText("Sam’s addition.");
  await expect(samEditor).toContainText("Alex’s addition.");
  await expect
    .poll(async () => (await noteText(alex)) === (await noteText(sam)))
    .toBe(true);
  await expect(sam.getByText("All changes saved")).toBeVisible();

  // Undo belongs to the visitor who made the change, preserving the other visitor's work.
  const mergedText = await noteText(alex);
  await alex.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(alexEditor).toContainText("Sam’s addition.");
  await expect(samEditor).not.toContainText("Alex’s addition.");
  await alex.getByRole("button", { name: "Redo", exact: true }).click();
  await expect.poll(() => noteText(alex)).toBe(mergedText);
  await expect.poll(() => noteText(sam)).toBe(mergedText);

  await sam.close();
  await expect(
    alex.locator(".participant-name").filter({ hasText: "Sam" }),
  ).toHaveCount(0);
  await alex.reload();
  await expect(
    alex.getByRole("textbox", { name: "Note content" }),
  ).toContainText("Sam’s addition.");
  await first.close();
  await second.close();
});

test("room creation, starring, sharing, text export, and focus mode work", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("textbox", { name: "Note title", exact: true }),
  ).toHaveValue("Welcome to your little space");
  await expect(
    page.getByRole("textbox", { name: "Note content" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "New room", exact: false }).click();
  await page
    .getByRole("textbox", { name: "Room name" })
    .fill("Friday brainstorm");
  await page.getByRole("button", { name: "Create room", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Note title", exact: true }),
  ).toHaveValue("Friday brainstorm");
  const editor = page.getByRole("textbox", { name: "Note content" });
  await editor.click();
  await page.keyboard.insertText("Bring the good ideas.\nAnd the coffee.");
  await expect(page.getByText("All changes saved")).toBeVisible();
  await page.getByRole("button", { name: "Star note", exact: true }).click();
  await page.getByRole("button", { name: "Starred", exact: false }).click();
  await expect(page.locator(".room-item")).toHaveCount(1);
  await page.getByRole("textbox", { name: "Search rooms" }).fill("Friday");
  await expect(page.locator(".room-item")).toHaveCount(1);
  await page.getByRole("button", { name: "Share room", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Your room link" }),
  ).toHaveValue(page.url());
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Note options" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download as text" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("Friday brainstorm.txt");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  if (stream) for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  expect(Buffer.concat(chunks).toString()).toBe(
    "Friday brainstorm\n\nBring the good ideas.\nAnd the coffee.\n",
  );
  await page.getByRole("button", { name: "Enter focus mode" }).click();
  await expect(page.locator(".focus-mode")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".focus-mode")).toHaveCount(0);
});

test("a small screen keeps navigation and the editor usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("textbox", { name: "Note content" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("button", { name: "Join a room" })).toBeVisible();
  await page.getByRole("button", { name: "Join a room" }).click();
  await page.getByRole("textbox", { name: "Room link or ID" }).fill("invalid");
  await page.getByRole("button", { name: "Join room", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "valid room ID",
  );
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Close navigation" }).click();
  await page.getByRole("button", { name: "Share room", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("the room API rejects invalid IDs and cross-origin writes", async ({
  request,
}) => {
  expect((await request.get("/api/rooms/short")).status()).toBe(400);
  expect(
    (
      await request.post(`/api/rooms/${randomUUID()}`, {
        headers: { Origin: "https://example.com" },
        data: { type: "document", data: "AA==" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post(`/api/rooms/${randomUUID()}`, {
        data: { type: "unknown", data: "AA==" },
      })
    ).status(),
  ).toBe(400);
});
