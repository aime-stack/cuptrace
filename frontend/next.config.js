/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: function (config, options) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Exclude Node.js built-in modules from client bundle
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      'node:crypto': false,
      process: false,
      os: false,
      path: false,
      stream: false,
      buffer: false,
    };

    // Resolve @utxorpc/sdk to ensure it's found even in nested node_modules
    // FAST TRACK FIX: Railway build fails without this manual resolution
    const path = require('path');
    const fs = require('fs');

    config.resolve.alias = {
      ...config.resolve.alias,
      '@utxorpc/sdk': path.resolve(process.cwd(), 'node_modules', '@utxorpc', 'sdk'),
    };


    return config;
  },
  // Allow external network access for mobile device testing
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'recharts', 'lodash', '@radix-ui/react-icons'],
  },
  transpilePackages: ['@meshsdk', '@utxorpc'],
}

module.exports = nextConfig