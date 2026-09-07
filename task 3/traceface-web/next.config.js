/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  webpack(config) {
    // The @vladmandic/human package's default "main"/"require" export is the
    // Node build, which needs the native tfjs-node dependency at bundle time.
    // Always resolve to the browser ESM bundle (tfjs is embedded) instead.
    config.resolve.alias["@vladmandic/human"] = path.resolve(
      __dirname,
      "node_modules/@vladmandic/human/dist/human.esm.js"
    );
    return config;
  },
};

module.exports = nextConfig;