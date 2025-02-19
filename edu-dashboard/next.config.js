/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      source: "/uploads/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=86400",
        },
      ],
    },
  ],
}

module.exports = nextConfig