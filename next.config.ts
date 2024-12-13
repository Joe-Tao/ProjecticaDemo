import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "ares.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      }
    ],
    domains: [
      'lh3.googleusercontent.com',  // Google 用户头像域名
      'avatars.githubusercontent.com',  // GitHub 头像
      'your-other-domain.com',         // 其他域名
    ],
  }
};

export default nextConfig;
