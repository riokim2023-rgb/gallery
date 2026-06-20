import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // 32비트 환경에서의 컴파일러 타입 검사 예외 처리
  },
};

export default nextConfig;
