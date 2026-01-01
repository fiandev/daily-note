import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fian's Daily",
  description: "Fian's Daily Learning Journal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth light">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Fian's Daily</title>
        <meta name="description" content="Fian's Daily Learning Journal" />
        <meta name="author" content="Fian" />

        <meta property="og:title" content="Fian's Daily" />
        <meta
          property="og:description"
          content="Fian's Daily Learning Journal"
        />
        <meta property="og:type" content="website" />

        <link
          rel="icon"
          type="image/png"
          href="https://fiandev.com/favicon-96x96.png"
          sizes="96x96"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href="https://fiandev.com/favicon.svg"
        />
        <link rel="shortcut icon" href="https://fiandev.com/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="https://fiandev.com/apple-touch-icon.png"
        />
        <link rel="manifest" href="https://fiandev.com/site.webmanifest" />

        <meta property="og:image" content="https://fiandev.com/graph.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@fiandev" />
        <meta name="twitter:image" content="https://fiandev.com/graph.png" />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
