import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


import { ReactNode } from 'react';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QR Check-in System",
  description: "QR Code-based attendance management system",
};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
          {children}
      </body>
    </html>
  );
}
