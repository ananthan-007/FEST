/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Tree-shake framer-motion — only bundles the parts actually used
    optimizePackageImports: ['framer-motion'],
  },
  // Enable HTTP compression
  compress: true,
  // Disable X-Powered-By header (minor security + perf)
  poweredByHeader: false,
}

export default nextConfig
