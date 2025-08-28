import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

import { ReactNode } from 'react';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quản lý tài sản - IUH",
  description: "Hệ thống quản lý tài sản - Đại học Công nghiệp TP.HCM",
  icons: {
    icon: "/logo_iuh.png",
    shortcut: "/logo_iuh.png",
    apple: "/logo_iuh.png",
  },
};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
