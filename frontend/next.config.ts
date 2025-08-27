/** @type {import('next').NextConfig} */
const nextConfig = {
async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/:path*", // проксируем на Spring Boot
      },
    ];
  },
};

module.exports = {
eslint: {
    ignoreDuringBuilds: true,
},
typescript: {
ignoreBuildErrors: true,
},
nextConfig
}
