import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The awareness protocol and server store must share one Yjs module instance.
  serverExternalPackages: ["yjs", "y-protocols"],
  devIndicators: false,
};

export default nextConfig;
