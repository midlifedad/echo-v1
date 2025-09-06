import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { TileProvider } from "@/contexts/TileContext";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Echo - Marketing Operating System",
  description: "Intelligent marketing dashboard and analytics platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider>
          <TileProvider>
            <AppShell>
              {children}
            </AppShell>
          </TileProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
