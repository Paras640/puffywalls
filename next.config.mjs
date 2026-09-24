/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa";

const shouldDisablePwa = true;

// 1. Initialize the PWA builder with optimized mobile configurations
const withPWA = withPWAInit({
  dest: "public",
  register: false,
  skipWaiting: false,
  disable: shouldDisablePwa,
});

const nextConfig = {
  /* Core configuration options go here */
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },
};

// 3. Export the combined configuration, wrapping your nextConfig with PWA capabilities
export default withPWA(nextConfig);
