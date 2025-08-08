import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";

import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "CreepyGallery",
  description: "Where nightmares become art",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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
