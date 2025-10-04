import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { TileProvider } from "@/contexts/TileContext";
import AppShell from "@/components/layout/AppShell";

// Load Inter font for body text (400-700 weights)
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

// Load Inter Tight for headlines (700-900 weights, condensed)
// Using Inter with variable font for now - will add Inter Tight later
const interTight = Inter({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-inter-tight",
  display: "swap",
});

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('echo-theme') || 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${interTight.variable} font-body`}>
        <ThemeProvider defaultTheme="light" enablePersistence>
          <SidebarProvider>
            <TileProvider>
              <AppShell>
                {children}
              </AppShell>
            </TileProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
