import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qurate — AI-Powered Web3 Payment Agent",
  description: "Pay with crypto as easily as scanning a QR code. Our AI Agent selects the cheapest tokens, chains (L2), and routes with full transparency.",
  openGraph: {
    title: "Qurate — AI-Powered Web3 Payment Agent",
    description: "The first truly autonomous AI payment agent for Web3. Multichain, Gasless focus, and Explainable AI.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qurate — AI-Powered Web3 Payment Agent",
    description: "Pay as easily as scanning a QR. Let AI handle the heavy blockchain technicals for you.",
  }
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
