import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#faf9f7",
};

export const metadata: Metadata = {
  title: "HTML Anything — the agentic HTML editor",
  description:
    "Markdown is the draft; HTML is what humans read. Your local AI agent writes HTML directly — decks, resumes, posters, knowledge cards, data reports, Hyperframes videos — one click to Twitter.",
  metadataBase: new URL("https://html-anything.app"),
  appleWebApp: {
    capable: true,
    title: "HTML Anything",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "HTML Anything — the agentic HTML editor",
    description: "Markdown is the draft. HTML is what humans read. Your local agent writes it.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      translate="no"
      className="h-full antialiased font-sans"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Inter+Tight:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full bg-[var(--paper)] text-[var(--ink)] selection:bg-[var(--coral)]/30"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
