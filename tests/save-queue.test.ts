import assert from "node:assert/strict";
import test from "node:test";
import { SaveConflictError, SaveQueue } from "../lib/save-queue";

const NOOP = () => undefined;

test("edits made during a request are serialized with the updated database revision", async () => {
  let finishFirst: (revision: number) => void = NOOP;
  const writes: { value: string; revision: number }[] = [];
  const queue = new SaveQueue("initial", 4, async (value, revision) => {
    writes.push({ value, revision });
    if (writes.length === 1) return new Promise<number>((resolve) => { finishFirst = resolve; });
    return revision + 1;
  }, NOOP);
  queue.update("first");
  const saved = queue.flush();
  queue.update("second");
  queue.update("latest");
  finishFirst(5);
  assert.equal(await saved, true);
  assert.deepEqual(writes, [{ value: "first", revision: 4 }, { value: "latest", revision: 5 }]);
  assert.equal(queue.status.isDirty, false);
  queue.dispose();
});

test("failed saves retain edits and can be retried without advancing the revision", async () => {
  let isFailing = true;
  const revisions: number[] = [];
  const queue = new SaveQueue("initial", 1, async (_value, revision) => {
    revisions.push(revision);
    if (isFailing) throw new Error("offline");
    return revision + 1;
  }, NOOP);
  queue.update("edited");
  assert.equal(await queue.flush(), false);
  assert.equal(queue.status.isDirty, true);
  assert.equal(queue.status.error, "offline");
  isFailing = false;
  assert.equal(await queue.flush(), true);
  assert.deepEqual(revisions, [1, 1]);
  queue.dispose();
});

test("conflicts block further writes instead of overwriting another device's data", async () => {
  let writes = 0;
  const queue = new SaveQueue("initial", 1, async () => { writes++; throw new SaveConflictError("conflict"); }, NOOP);
  queue.update("edited");
  await queue.flush();
  queue.update("later");
  assert.equal(await queue.flush(), false);
  assert.equal(queue.status.isConflict, true);
  assert.equal(queue.status.isDirty, true);
  assert.equal(writes, 1);
  queue.dispose();
});

test("disposing an account prevents pending writes and obsolete completion notifications", async () => {
  let finishSave: (revision: number) => void = NOOP;
  let notifications = 0;
  const queue = new SaveQueue("initial", 1, async () => new Promise<number>((resolve) => { finishSave = resolve; }), () => { notifications++; });
  queue.update("edited");
  const result = queue.flush();
  queue.update("pending");
  queue.dispose();
  const previousNotifications = notifications;
  finishSave(2);
  assert.equal(await result, false);
  assert.equal(notifications, previousNotifications);
});
