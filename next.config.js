/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gateway.ipfscdn.io',
        pathname: '/ipfs/**',
      },
    ],
  },
}
module.exports = nextConfig
