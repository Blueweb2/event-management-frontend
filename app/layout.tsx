import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "EventFlow | Event Management Made Simple",
    template: "%s | EventFlow",
  },
  description:
    "Manage events, customers, staff duties, food planning, expenses, payments, and reports from one responsive event management platform.",
  keywords: [
    "event management",
    "event planning",
    "staff management",
    "catering management",
    "food calculation",
    "event expenses",
    "event management software",
  ],
  applicationName: "EventFlow",
  authors: [
    {
      name: "EventFlow",
    },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} bg-white text-gray-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}