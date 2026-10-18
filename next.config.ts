import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/manager/availability",
        destination: "/manager/staff?tab=availability",
        permanent: false,
      },
      {
        source: "/manager/attendance",
        destination: "/manager/staff?tab=attendance",
        permanent: false,
      },
      {
        source: "/manager/assignments",
        destination: "/manager/staff",
        permanent: false,
      },
      {
        source: "/manager/schedule",
        destination: "/manager/staff",
        permanent: false,
      },
      {
        source: "/manager/payroll",
        destination: "/manager/staff?tab=payroll",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/manifest.json",
        destination: "/manifest.webmanifest",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/staff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

