/** @type {import('next').NextConfig} */
const API_TARGET = process.env.NEXT_PUBLIC_API_TARGET || "http://127.0.0.1:8080";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_TARGET}/:path*`,
      },
    ];
  },
};

module.exports = Object.assign(
  {},
  {
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
  },
  nextConfig
);
