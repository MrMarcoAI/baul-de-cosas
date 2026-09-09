import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Permite abrir el dev server desde el iPhone en la red local.
  allowedDevOrigins: ["192.168.0.27", "*.local"],
  /* config options here */
};

export default nextConfig;
