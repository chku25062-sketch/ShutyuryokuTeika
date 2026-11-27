/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // CIパイプラインで検査するためビルド時の暗黙チェックでの失敗を防止
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
