/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for pages router (default)
  // Allow external network access for mobile device testing
  async rewrites() {
    return [];
  },
}

module.exports = nextConfig