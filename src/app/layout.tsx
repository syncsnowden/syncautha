import type { Metadata } from "next";
import "./globals.css";
import ThemeToaster from "@/components/ThemeToaster";

export const metadata: Metadata = {
  title: "SyncAuth — Secure License Authentication",
  description:
    "SyncAuth is a premium license key authentication system. Protect your scripts and software with enterprise-grade key validation, HWID binding, and real-time analytics.",
  keywords: ["SyncAuth", "license key", "authentication", "script protection", "HWID binding"],
  openGraph: {
    title: "SyncAuth — Secure License Authentication",
    description: "Enterprise-grade license key authentication for scripts and software.",
    type: "website",
  },
  icons: {
    icon: "/syncauthlogo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeToaster />
        {children}
      </body>
    </html>
  );
}
