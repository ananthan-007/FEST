import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FEST · Kerala NCC Fest",
  description: "Official National Cadet Corps Annual Inter-Collegiate Conclave & Registration Platform in Kerala.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#050A18",
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
      <body className="bg-space-dark text-on-surface font-sans antialiased selection:bg-primary-container selection:text-white min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
