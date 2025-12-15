/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: function (config, options) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    // Handle @utxorpc and @meshsdk dependencies
    // Exclude Node.js built-in modules from client bundle
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      async_hooks: false,
      child_process: false,
      cluster: false,
      dgram: false,
      dns: false,
      http2: false,
      module: false,
      os: false,
      path: false,
      perf_hooks: false,
      process: false,
      punycode: false,
      querystring: false,
      readline: false,
      repl: false,
      stream: false,
      string_decoder: false,
      sys: false,
      timers: false,
      tty: false,
      url: false,
      util: false,
      v8: false,
      vm: false,
      zlib: false,
      crypto: false,
      'node:crypto': false,
      buffer: false,
      events: false,
      http: false,
      https: false,
    };

    // Resolve @utxorpc/sdk to ensure it's found even in nested node_modules
    const path = require('path');
    const fs = require('fs');

    // Try multiple possible locations for @utxorpc/sdk
    const possiblePaths = [
      path.resolve(process.cwd(), 'node_modules', '@utxorpc', 'sdk'),
      path.resolve(process.cwd(), 'node_modules', '@meshsdk', 'web3-sdk', 'node_modules', '@utxorpc', 'sdk'),
      path.resolve(process.cwd(), 'node_modules', '@meshsdk', 'provider', 'node_modules', '@utxorpc', 'sdk'),
    ];

    let utxorpcPath = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        utxorpcPath = possiblePath;
        break;
      }
    }

    // Fix for bip174/bitcoinjs-lib issues
    // Since this is a Cardano project, we don't need Bitcoin functionality
    // But @meshsdk/react imports it, so we need to handle it properly
    const webpack = require('webpack');

    if (!config.plugins) {
      config.plugins = [];
    }

    // Replace Node.js version of @utxorpc/sdk with browser version
    if (utxorpcPath) {
      const browserPath = path.join(utxorpcPath, 'lib', 'browser', 'index.mjs');
      const nodePath = path.join(utxorpcPath, 'lib', 'node', 'index.mjs');

      // Check if browser version exists
      if (fs.existsSync(browserPath)) {
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(
            /@utxorpc\/sdk\/lib\/node\/index\.mjs/,
            browserPath
          )
        );

        config.resolve.alias = {
          ...config.resolve.alias,
          '@utxorpc/sdk': utxorpcPath,
          // Force browser version instead of Node.js version
          '@utxorpc/sdk/lib/node/index.mjs': browserPath,
        };
      } else {
        config.resolve.alias = {
          ...config.resolve.alias,
          '@utxorpc/sdk': utxorpcPath,
        };
      }
    }

    // Replace bitcoinjs-lib imports with a stub to avoid bip174 issues
    // This prevents the build from failing on Bitcoin-related code we don't use
    const stubPath = path.resolve(process.cwd(), 'src', 'lib', 'mocks', 'bitcoinjs-lib-stub.js');

    // Ignore bip174 to prevent export field issues
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^bip174$/,
        contextRegExp: /bitcoinjs-lib/,
      }),
      new webpack.NormalModuleReplacementPlugin(
        /bitcoinjs-lib/,
        stubPath
      )
    );

    // Stub node-datachannel to avoid native compilation issues
    const nodeDatachannelStubPath = path.resolve(process.cwd(), 'src', 'lib', 'mocks', 'node-datachannel-stub.js');

    // Exclude Node.js-only packages from client bundle
    // undici and @connectrpc/connect-node are server-only
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^node-datachannel$/,
        nodeDatachannelStubPath
      ),
      // Ignore Node.js-only packages that shouldn't be in client bundle
      new webpack.IgnorePlugin({
        resourceRegExp: /^undici$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^@connectrpc\/connect-node$/,
      })
    );

    // Provide aliases to handle the problematic imports
    config.resolve.alias = {
      ...config.resolve.alias,
      // Stub bitcoinjs-lib to avoid bip174 export issues
      'bitcoinjs-lib': stubPath,
      // Stub node-datachannel to avoid native build issues
      'node-datachannel': nodeDatachannelStubPath,
    };

    // Ensure webpack can resolve modules from nested node_modules
    config.resolve.modules = [
      path.resolve(process.cwd(), 'node_modules'),
      'node_modules',
    ];

    // Configure webpack to be less strict about package exports
    // This allows importing from package src directories
    if (!config.resolve.conditionNames) {
      config.resolve.conditionNames = ['require', 'node', 'import'];
    }

    // Allow importing files without extensions
    config.resolve.fullySpecified = false;

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
  async rewrites() {
    return [];
  },
}

module.exports = nextConfig