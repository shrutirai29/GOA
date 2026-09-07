import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const space = Space_Grotesk({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const SITE_URL = "https://traceface.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "TraceFace — Discover. Verify. Prove.",
  description:
    "Face Identification & Blockchain Verification Platform. Discover visual matches, create cryptographic evidence, and anchor it on the blockchain.",
  keywords: [
    "face identification",
    "blockchain verification",
    "reverse image search",
    "evidence hashing",
    "digital forensics",
    "TraceFace",
  ],
  openGraph: {
    title: "TraceFace — Discover. Verify. Prove.",
    description:
      "Face Identification & Blockchain Verification Platform. A digital investigation and verification tool.",
    url: SITE_URL,
    siteName: "TraceFace",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TraceFace — Discover. Verify. Prove.",
    description:
      "Face Identification & Blockchain Verification Platform.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#030806",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${space.variable} ${jetbrains.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
