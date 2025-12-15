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
      async_hooks: false,
      'stream/web': false,
      'util/types': false,
      worker_threads: false,
    };

    // Fix for Railway build failing to find @utxorpc/sdk
    const path = require('path');
    const { webpack } = options;

    // 1. Force resolution to browser version for @utxorpc/sdk
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /@utxorpc\/sdk\/lib\/node/,
        resource => {
          resource.request = resource.request.replace('/node/', '/browser/');
        }
      )
    );

    // 2. Ignore Node.js-only dependencies
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^undici$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^@connectrpc\/connect-node$/,
      })
    );

    // 3. Robust alias for @utxorpc/sdk
    config.resolve.alias = {
      ...config.resolve.alias,
      '@utxorpc/sdk': path.resolve(process.cwd(), 'node_modules', '@utxorpc', 'sdk', 'lib', 'browser', 'index.mjs'),
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