/** @type {import('next').NextConfig} */
const nextConfig = {
  // A self-contained server bundle (node .next/standalone/server.js) keeps the
  // runtime image small and means the container needs no node_modules or
  // project sources at run time.
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
