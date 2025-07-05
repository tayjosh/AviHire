process.env.NEXT_DISABLE_CONFIG_CHANGE_WARNING = 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // This will let you ship even if there are unused-var or hook warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
