import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve.alias["@components"] = path.resolve(__dirname, "../components");
    config.resolve.alias["@types"] = path.resolve(__dirname, "../types.ts");
    return config;
  },
};

export default nextConfig;
