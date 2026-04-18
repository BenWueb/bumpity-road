import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    // Tree-shake icon barrels so importing `import { Foo } from "lucide-react"`
    // only ships `Foo`, not the entire icon set. Same trick helps for
    // `date-fns` and similar large barrel exports.
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
