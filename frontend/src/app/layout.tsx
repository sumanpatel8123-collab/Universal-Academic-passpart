import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Universal Academic Passport | Decentralized Stellar Credentials",
  description: "Soulbound degree verification platform powered by Soroban Smart Contracts on Stellar Blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#080a0f] text-slate-100 selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
