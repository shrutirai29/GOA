import type { Metadata, Viewport } from "next";
import { Anton, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Cursor } from "@/components/ui/Cursor";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

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

const SITE_URL = "https://hhgoa-2026.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "HH Goa 2026 — Build Your Identity",
  description:
    "Create your HH Goa 2026 builder identity card or PFP frame. Upload your photo, customize your identity and share it with #FrameInGoa.",
  keywords: ["HH Goa", "Goa 2026", "builder", "identity card", "PFP", "FrameInGoa", "hackathon"],
  openGraph: {
    title: "HH Goa 2026 — Build Your Identity",
    description:
      "Create your HH Goa 2026 builder identity card or PFP frame. Upload your photo, customize your identity and share it with #FrameInGoa.",
    url: SITE_URL,
    siteName: "HH Goa 2026",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/og", width: 1200, height: 630, alt: "HH Goa 2026 — Build Your Identity" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HH Goa 2026 — Build Your Identity",
    description:
      "Create your HH Goa 2026 builder identity card or PFP frame. Upload your photo, customize your identity and share it with #FrameInGoa.",
    images: ["/og"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#05040a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${anton.variable} ${space.variable} ${jetbrains.variable} antialiased`}
      >
        <NoiseOverlay />
        <Cursor />
        {children}
      </body>
    </html>
  );
}
