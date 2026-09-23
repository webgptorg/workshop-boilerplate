export function spaceTrim(message: string): string {
  return message
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}
