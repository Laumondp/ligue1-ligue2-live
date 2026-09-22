import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/equipes", destination: "/france/equipes", permanent: true },
      { source: "/direct", destination: "/france/direct", permanent: true },
      { source: "/classement", destination: "/france/classement", permanent: true },
    ];
  },
};

export default nextConfig;
