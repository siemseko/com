import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SidebarLayout from "@/components/sidebar";
import { Suspense } from "react"; // 1. Import Suspense

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Automated Image",
  description: "Processing Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 2. Wrap SidebarLayout in Suspense */}
        <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-950" />}>
          <SidebarLayout>
            {children}
          </SidebarLayout>
        </Suspense>
      </body>
    </html>
  );
}