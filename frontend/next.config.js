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
    
    // Ensure webpack can resolve modules from nested node_modules
    config.resolve.modules = [
      path.resolve(process.cwd(), 'node_modules'),
      'node_modules',
    ];
    
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