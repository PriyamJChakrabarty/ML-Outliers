/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // Allow external packages for server components
  serverExternalPackages: ['@xenova/transformers'],

  // Allow Clerk avatar images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
