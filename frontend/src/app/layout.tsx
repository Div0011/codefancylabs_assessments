import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Project Tracker",
  description: "Mini Project Tracker for Codefancy Lab",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-sav-bg">
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] -translate-y-1/2 translate-x-1/4 rounded-full bg-sav-gold-pale/20 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] translate-y-1/3 -translate-x-1/4 rounded-full bg-sav-tan/15 blur-[80px]" />
        </div>
        <Sidebar />
        <main className="md:ml-64 min-h-screen">
          <div className="mx-auto max-w-7xl p-6 lg:p-10">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
