import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary-backed uploads (question/profile/subject images).
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Local backend uploads during development.
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
