import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import { ReactNode } from "react";
import { AuthProvider } from "../lib/auth-context";

export const metadata: Metadata = {
  title: "CreepyGallery",
  description: "Where shadows come to life",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-[#F8F8FF]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
