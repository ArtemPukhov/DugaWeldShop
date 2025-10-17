/** @type {import('next').NextConfig} */
const API_TARGET = process.env.NEXT_PUBLIC_API_TARGET || "http://127.0.0.1:8080";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/dugaweld-images/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9000',
        pathname: '/dugaweld-images/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      // Для endpoints с префиксом /api (carousel, files)
      {
        source: "/api/carousel/:path*",
        destination: `${API_TARGET}/api/carousel/:path*`,
      },
      {
        source: "/api/files/:path*",
        destination: `${API_TARGET}/api/files/:path*`,
      },
      // Для endpoints без префикса /api (categories, products, auth)
      {
        source: "/api/categories/:path*",
        destination: `${API_TARGET}/categories/:path*`,
      },
      {
        source: "/api/products/:path*",
        destination: `${API_TARGET}/products/:path*`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${API_TARGET}/auth/:path*`,
      },
      {
        source: "/api/users/:path*",
        destination: `${API_TARGET}/users/:path*`,
      },
      {
        source: "/api/orders/:path*",
        destination: `${API_TARGET}/orders/:path*`,
      },
    ];
  },
  // Настройки для обработки файлов
  serverExternalPackages: [],
  // Увеличиваем лимиты для загрузки файлов
  serverRuntimeConfig: {
    maxFileSize: '20mb',
  },
  publicRuntimeConfig: {
    maxFileSize: '20mb',
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
