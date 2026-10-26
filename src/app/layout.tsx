import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LuckHub Bangladesh 🇧🇩 | Official Casino Platform (৳ BDT)",
  description: "Play Aviator Crash, 777 Slots, Teen Patti, Dice, and Win BDT with Instant bKash & Nagad deposits & withdrawals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎰</text></svg>" />
      </head>
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
