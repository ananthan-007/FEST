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
  // Allow Next.js <Image> to load from Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
