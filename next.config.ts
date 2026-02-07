/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'siemseko.github.io',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;