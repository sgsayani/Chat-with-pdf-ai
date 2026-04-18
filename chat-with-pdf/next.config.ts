import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse must run in Node.js runtime, not Edge — this keeps it server-side
  serverExternalPackages: ["pdf-parse"],
  // Next.js 16 uses Turbopack by default; empty config silences the webpack conflict warning
  turbopack: {},
};

export default nextConfig;
