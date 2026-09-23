import { spawnSync } from "node:child_process";

const BUILD = spawnSync("npm", ["run", "build"], {
  env: {
    ...process.env,
    NEXT_FONT_GOOGLE_MOCKED_RESPONSES: "{}",
  },
  encoding: "utf8",
  stdio: "pipe",
});

if (BUILD.status !== 0) {
  process.stderr.write(BUILD.stdout);
  process.stderr.write(BUILD.stderr);
  process.exit(BUILD.status ?? 1);
}

process.stdout.write("Production build succeeded without Google Fonts access.\n");
