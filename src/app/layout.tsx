import { SKRIP_TEMA } from "@/libs/Theme";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PANJI JAYA — Enterprise Management System",
  description: "Enterprise Management System",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="/workload/css/style.css" rel="stylesheet" />
        <link href="/workload/css/ems.css" rel="stylesheet" />
      </head>
      {/*
        suppressHydrationWarning: skrip di bawah mengubah data-theme-version dan
        data-sidebar-style pada <body> sebelum hydration, jadi nilainya memang
        beda dari hasil render server.
      */}
      <body
        suppressHydrationWarning
        data-typography="poppins"
        data-theme-version="light"
        data-layout="vertical"
        data-nav-headerbg="color_1"
        data-headerbg="color_1"
        data-sidebar-style="full"
        data-sibebarbg="color_1"
        data-primary="color_1"
        data-sidebar-position="fixed"
        data-header-position="fixed"
        data-container="wide"
      >
        {/* Tema + gaya sidebar dipasang sebelum konten tampil, supaya tidak berkedip. */}
        <script dangerouslySetInnerHTML={{ __html: SKRIP_TEMA }} />
        {children}
      </body>
    </html>
  );
}
