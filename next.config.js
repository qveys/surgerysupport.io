/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    // Fix for searchParams issue in Next.js 15
    missingSuspenseWithCSRBailout: false,
  },
  webpack: (config, { isServer }) => {
    // Ignore optional native dependencies for ws library
    config.externals = config.externals || [];
    config.externals.push({
      'bufferutil': 'bufferutil',
      'utf-8-validate': 'utf-8-validate',
    });

    // For client-side builds, ignore these modules completely
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'bufferutil': false,
        'utf-8-validate': false,
      };
    }

    // Suppress the specific Supabase realtime warnings
    config.module = config.module || {};
    config.module.exprContextCritical = false;
    config.module.unknownContextCritical = false;

    return config;
  },
};

module.exports = nextConfig;