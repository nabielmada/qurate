import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qurate — AI-Powered Web3 Payment Agent",
  description: "Bayar dengan crypto semudah scan QR. AI memilih token, chain, dan rute termurah untuk Anda.",
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
