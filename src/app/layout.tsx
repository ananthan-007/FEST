import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import DhruvaSplashLoader from "@/components/DhruvaSplashLoader";

export const metadata: Metadata = {
  title: "DHRUVA · Kerala NCC Conclave",
  description: "DHRUVA — Official National Cadet Corps Annual Inter-Collegiate Conclave & Registration Platform in Kerala.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-space-dark text-on-surface font-sans antialiased selection:bg-[#CC892F] selection:text-[#050505] min-h-screen flex flex-col">
        <DhruvaSplashLoader />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
