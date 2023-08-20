/** @type {import('next').NextConfig} */

const BACKEND_DEV_PORT = process.env.WHOMBAT_BACKEND_DEV_PORT || 8000;

const nextConfig = {
  // output: "export",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `http://localhost:${BACKEND_DEV_PORT}/api/:path*`
      },
      {
        source: "/auth/:path*",
        destination: `http://localhost:${BACKEND_DEV_PORT}/auth/:path*`
      }
    ]
  }
};

module.exports = nextConfig;
