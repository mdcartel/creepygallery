/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for production
  serverExternalPackages: ['pg', 'bcryptjs'],
  
  // Image optimization
  images: {
    domains: ['ik.imagekit.io'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;