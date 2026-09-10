import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import AppShell from "@/components/AppShell";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Champions 48 · Marco",
  description: "Torneo custom de 48 equipos con formato suizo UEFA",
  appleWebApp: { capable: true, title: "Champions 48", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0d2050",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${anton.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
