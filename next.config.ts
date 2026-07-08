import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "fm6.ir",
                pathname: "/avatars/**",
            },
        ],
    },
};

export default nextConfig;
