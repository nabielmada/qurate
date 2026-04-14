import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qurate — AI-Powered Web3 Payment Agent",
  description: "Bayar dengan crypto semudah scan QR. AI Agent kami memilih token, chain (L2), dan rute termurah dangan transparansi penuh.",
  openGraph: {
    title: "Qurate — AI-Powered Web3 Payment Agent",
    description: "The first truly autonomous AI payment agent for Web3. Multichain, Gasless focus, and Explainable AI.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qurate — AI-Powered Web3 Payment Agent",
    description: "Bayar semudah scan QR. Biarkan AI yang mengurus teknis Blockchain-nya.",
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
