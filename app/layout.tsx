import type { Metadata } from "next";
import { Work_Sans, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { TileProvider } from "@/contexts/TileContext";
import AppShell from "@/components/layout/AppShell";
import { BirdsAnimation } from "@/components/BirdsAnimation";

// Load Work Sans for body text - geometric, bold, statement font
const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-work-sans",
  display: "swap",
});

// Load Bebas Neue for headlines - ultra bold, condensed display font
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"], // Bebas Neue only has one weight but it's very bold
  variable: "--font-bebas-neue",
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
      <body className={`${workSans.variable} ${bebasNeue.variable} font-body`}>
        <ThemeProvider defaultTheme="light" enablePersistence>
          <SidebarProvider>
            <TileProvider>
              <AppShell>
                {children}
              </AppShell>
              <BirdsAnimation />
            </TileProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
