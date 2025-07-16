/** @type {import('next').NextConfig} */





const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuration pour React 17 - pas de fonctionnalités expérimentales modernes
  experimental: {
    appDir: false,
  }
}

module.exports = nextConfig
