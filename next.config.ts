import type { NextConfig } from "next";

const NEXT_CONFIG: NextConfig = {
  serverExternalPackages: ["pg"],
  outputFileTracingIncludes: {
    "/*": ["./migrations/**/*.sql"],
  },
};

export default NEXT_CONFIG;
