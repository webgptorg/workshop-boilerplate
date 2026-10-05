import assert from "node:assert/strict";
import test from "node:test";
import { getAudioUploadLimits, isAudioUploadDurationAllowed, isAudioUploadSizeAllowed } from "../lib/audio-upload-configuration";

test("audio uploads default to inclusive 500 MB and five-hour limits", () => {
  const LIMITS = getAudioUploadLimits("", "");
  assert.equal(LIMITS.maxSizeBytes, 500 * 1024 * 1024);
  assert.equal(LIMITS.maxDurationSeconds, 18_000);
  assert.equal(isAudioUploadSizeAllowed(1, LIMITS), true);
  assert.equal(isAudioUploadSizeAllowed(LIMITS.maxSizeBytes, LIMITS), true);
  assert.equal(isAudioUploadSizeAllowed(LIMITS.maxSizeBytes + 1, LIMITS), false);
  assert.equal(isAudioUploadDurationAllowed(LIMITS.maxDurationSeconds, LIMITS), true);
  assert.equal(isAudioUploadDurationAllowed(LIMITS.maxDurationSeconds + 0.01, LIMITS), false);
  for (const INVALID of [0, -1, NaN, Infinity]) {
    assert.equal(isAudioUploadSizeAllowed(INVALID, LIMITS), false);
    assert.equal(isAudioUploadDurationAllowed(INVALID, LIMITS), false);
  }
});

test("audio limits support independent positive numeric overrides", () => {
  const LIMITS = getAudioUploadLimits(" 750 ", "2.5");
  assert.equal(LIMITS.maxSizeMegabytes, 750);
  assert.equal(LIMITS.maxDurationHours, 2.5);
  assert.equal(isAudioUploadSizeAllowed(750 * 1024 * 1024, LIMITS), true);
  assert.equal(isAudioUploadSizeAllowed(750 * 1024 * 1024 + 1, LIMITS), false);
  assert.equal(isAudioUploadDurationAllowed(9_000, LIMITS), true);
  assert.equal(isAudioUploadDurationAllowed(9_001, LIMITS), false);
  assert.equal(getAudioUploadLimits(" ", "10").maxSizeMegabytes, 500);
  assert.equal(getAudioUploadLimits("0.5", "").maxDurationHours, 5);
});

test("invalid audio limit settings fail with the configuration variable name", () => {
  for (const INVALID of ["0", "-1", "invalid", "NaN", "Infinity", "1e100"]) {
    assert.throws(() => getAudioUploadLimits(INVALID, "5"), /NEXT_PUBLIC_MAX_AUDIO_UPLOAD_SIZE_MB/);
    assert.throws(() => getAudioUploadLimits("500", INVALID), /NEXT_PUBLIC_MAX_AUDIO_UPLOAD_DURATION_HOURS/);
  }
});
