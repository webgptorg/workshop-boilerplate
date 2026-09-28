import assert from "node:assert/strict";
import test from "node:test";
import { consumeRecordingStart, requestRecordingStart } from "../lib/recording-intent";

test("an instant recording request is consumed once by its meeting studio", () => {
  requestRecordingStart("new-meeting");
  assert.equal(consumeRecordingStart("another-meeting"), false);
  assert.equal(consumeRecordingStart("new-meeting"), true);
  assert.equal(consumeRecordingStart("new-meeting"), false);
});
