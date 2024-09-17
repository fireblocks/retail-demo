/** @type {import('next').NextConfig} */
const nextConfig = {
  "reactStrictMode": false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
        port: "",
        pathname: "*/**",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "*/**",
      },
    ],
  },
};



export default nextConfig;
