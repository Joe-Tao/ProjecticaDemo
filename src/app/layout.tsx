import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Projectica",
  description: "Your AI-powered project management tool",
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
        <SessionProvider>
          <div className="flex">
            {/* <div className="bg-black text-gray-300 max-w-[250px] h-screen overflow-y-auto md:min-w-[220px]">
              <Sidebar />
            </div> */}
            <div className="bg-[#212121] text-gray-300 flex-1 h-screen overflow-hidden relative">
              <Header />
              {children}
            </div>
          </div>
        </SessionProvider>
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: "#000000",
            color: "#ffffff",
          },
        }}/>
        {/* <footer className="bg-black text-center text-gray-300 text-sm p-4">
          &copy; {new Date().getFullYear()} Projectica. All rights reserved.
        </footer> */}
      </body>
      
    </html>
  );
}
