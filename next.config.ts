import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 允許區域網路 IP 存取 HMR WebSocket（解決 LAN 連線卡住的問題）
  // 如果您的區域網路 IP 不同，請修改此處
  allowedDevOrigins: [
    "192.168.68.115",
    "192.168.68.*",
    "192.168.*.*",
  ],

  // 關閉開發模式右下角的轉圈指示器
  devIndicators: false,
};

export default nextConfig;
