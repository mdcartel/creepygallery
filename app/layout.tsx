import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";

import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "CreepyGallery",
  description: "Where shadows come to life",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-[#F8F8FF]">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
