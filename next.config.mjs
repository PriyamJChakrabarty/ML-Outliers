/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // Allow external packages for server components
  serverExternalPackages: ['@xenova/transformers'],
};

export default nextConfig;
