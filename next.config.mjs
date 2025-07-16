/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';
const WithNextIntl = createNextIntlPlugin()


const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default WithNextIntl(nextConfig) 
