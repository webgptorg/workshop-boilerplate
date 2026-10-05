import { open } from "node:fs/promises";

function waveHeader(audioSize: number, sampleRate: number): Buffer {
  const BUFFER = Buffer.alloc(44);
  BUFFER.write("RIFF", 0);
  BUFFER.writeUInt32LE(36 + audioSize, 4);
  BUFFER.write("WAVEfmt ", 8);
  BUFFER.writeUInt32LE(16, 16);
  BUFFER.writeUInt16LE(1, 20);
  BUFFER.writeUInt16LE(1, 22);
  BUFFER.writeUInt32LE(sampleRate, 24);
  BUFFER.writeUInt32LE(sampleRate * 2, 28);
  BUFFER.writeUInt16LE(2, 32);
  BUFFER.writeUInt16LE(16, 34);
  BUFFER.write("data", 36);
  BUFFER.writeUInt32LE(audioSize, 40);
  return BUFFER;
}

// A small, valid PCM WAV exercises browser decoding and IndexedDB without a fixture file.
export function audioUpload(name = "interview.wav") {
  const SAMPLE_RATE = 8_000;
  const AUDIO_SIZE = SAMPLE_RATE * 2;
  const BUFFER = Buffer.concat([waveHeader(AUDIO_SIZE, SAMPLE_RATE), Buffer.alloc(AUDIO_SIZE)]);
  return { name, mimeType: "audio/wav", buffer: BUFFER };
}

// Sparse files exercise real large uploads without allocating huge Node buffers.
export async function writeAudioUpload(path: string, sizeBytes: number, sampleRate = 8_000) {
  const FILE = await open(path, "w");
  try {
    await FILE.write(waveHeader(sizeBytes - 44, sampleRate));
    await FILE.truncate(sizeBytes);
  } finally {
    await FILE.close();
  }
  return path;
}
