import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"; // Import the toaster component

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Path AI - Your AI-Powered Learning Companion",
  description: "Discover personalized learning paths, AI-generated courses, and interactive lessons tailored to your goals. Start your journey with Path AI today!",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Place Toaster here so it's globally available */}
        <Toaster position="top-center" richColors />
        
        {children}
      </body>
    </html>
  );
}