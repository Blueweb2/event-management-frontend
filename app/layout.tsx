import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pircello Events",
    template: "%s | Pircello Events",
  },
  description:
    "Pircello Events — a professional event management platform for planning, managing, estimating, and delivering exceptional events.",
  applicationName: "Pircello Events",
  authors: [
    {
      name: "Pircello Events",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} bg-[#0b0b0a] text-gray-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}