// A small, valid PCM WAV exercises browser decoding and IndexedDB without a fixture file.
export function audioUpload(name = "interview.wav") {
  const SAMPLE_RATE = 8_000;
  const AUDIO_SIZE = SAMPLE_RATE * 2;
  const BUFFER = Buffer.alloc(44 + AUDIO_SIZE);
  BUFFER.write("RIFF", 0);
  BUFFER.writeUInt32LE(36 + AUDIO_SIZE, 4);
  BUFFER.write("WAVEfmt ", 8);
  BUFFER.writeUInt32LE(16, 16);
  BUFFER.writeUInt16LE(1, 20);
  BUFFER.writeUInt16LE(1, 22);
  BUFFER.writeUInt32LE(SAMPLE_RATE, 24);
  BUFFER.writeUInt32LE(AUDIO_SIZE, 28);
  BUFFER.writeUInt16LE(2, 32);
  BUFFER.writeUInt16LE(16, 34);
  BUFFER.write("data", 36);
  BUFFER.writeUInt32LE(AUDIO_SIZE, 40);
  return { name, mimeType: "audio/wav", buffer: BUFFER };
}
