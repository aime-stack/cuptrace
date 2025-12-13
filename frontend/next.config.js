/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: function (config, options) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    // Handle @utxorpc and @meshsdk dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
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
    
    if (utxorpcPath) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@utxorpc/sdk': utxorpcPath,
      };
    }
    
    // Fix for bip174 exports issue with bitcoinjs-lib
    // bitcoinjs-lib tries to import internal paths from bip174 that aren't exported
    // Use webpack's NormalModuleReplacementPlugin to handle these imports
    const webpack = require('webpack');
    const bip174Path = path.resolve(process.cwd(), 'node_modules', 'bip174');
    
    if (fs.existsSync(bip174Path)) {
      const varintPath = path.join(bip174Path, 'src', 'lib', 'converter', 'varint.js');
      const utilsPath = path.join(bip174Path, 'src', 'lib', 'utils.js');
      
      // Add aliases for bip174 internal paths
      config.resolve.alias = {
        ...config.resolve.alias,
        'bip174/src/lib/converter/varint': varintPath,
        'bip174/src/lib/utils': utilsPath,
      };
      
      // Also add a plugin to rewrite the imports
      // This bypasses the package.json exports field check
      if (!config.plugins) {
        config.plugins = [];
      }
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /bip174\/src\/lib\/converter\/varint/,
          varintPath
        ),
        new webpack.NormalModuleReplacementPlugin(
          /bip174\/src\/lib\/utils/,
          utilsPath
        )
      );
    }
    
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