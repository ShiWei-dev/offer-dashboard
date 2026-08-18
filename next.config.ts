import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // 如果部署到子路径，取消注释并配置 basePath
  // basePath: '/offer-dashboard',
};

export default nextConfig;
