// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AviHire",
  description: "Verified aviation jobs for A&Ps and Pilots",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="flex items-center justify-between px-6 py-4 border-b shadow-sm bg-white sticky top-0 z-50">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/avihirelogo.png"
              alt="AviHire"
              width={140}
              height={60}
              className="object-contain"
              priority
            />
          </Link>

          {/* Auth Buttons Only */}
          <div className="flex space-x-3">
            <Link href="/auth">
              <button className="text-sm bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700">
                Sign In
              </button>
            </Link>
            <Link href="/signup">
              <button className="text-sm bg-gray-800 text-white px-4 py-1 rounded-md hover:bg-gray-900">
                Sign Up
              </button>
            </Link>
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
