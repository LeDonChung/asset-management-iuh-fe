/** @type {import('next').NextConfig} */
const nextConfig = {
  // config options here

  // output: 'standalone', // Enable if build for Docker

  async redirects() {
    return [];
  },

  eslint: {
    // Warning: production build vẫn chạy dù có lỗi ESLint
    ignoreDuringBuilds: true,
  },

  typescript: {
    // Warning: production build vẫn chạy dù có lỗi TypeScript
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
