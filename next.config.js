/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use ESLint for warnings during development, not errors
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during production builds
    dirs: ["pages", "components", "lib", "utils", "config", "hooks", "store"], // Directories to lint
  },
  reactStrictMode: true,
  // Add other Next.js config options here
};

module.exports = nextConfig;
