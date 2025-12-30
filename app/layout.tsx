import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ScrollToTop } from "@/components/scroll-to-top"
import { FloatingContact } from "@/components/floating-contact"
import { ThemeProvider } from "@/components/theme-provider"
import { CookieBanner } from "@/components/cookie-banner"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { OfflineIndicator } from "@/components/offline-indicator"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AssetCare24 – Ihr intelligenter Haushalts-Organizer",
  description:
    "Verwalten Sie Ihr Zuhause smart: Von der Lampenreparatur bis zur kompletten Hausbetreuung. Alles digital, transparent und bequem.",
  keywords: [
    "Hausmeister",
    "Handwerker",
    "Berlin",
    "München",
    "Hamburg",
    "Reparatur",
    "Hausverwaltung",
    "Immobilien",
    "Service",
  ],
  authors: [{ name: "AssetCare24" }],
  creator: "AssetCare24",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AssetCare24",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    title: "AssetCare24 – Ihr intelligenter Haushalts-Organizer",
    description: "Verwalten Sie Ihr Zuhause smart. Alles digital, transparent und bequem.",
    type: "website",
    locale: "de_DE",
    siteName: "AssetCare24",
  },
  twitter: {
    card: "summary_large_image",
    title: "AssetCare24 – Ihr intelligenter Haushalts-Organizer",
    description: "Verwalten Sie Ihr Zuhause smart. Alles digital, transparent und bequem.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#004728" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1512" },
  ],
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`font-sans antialiased touch-manipulation`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <OfflineIndicator />
          <ScrollToTop />
          {children}
          <FloatingContact />
          <CookieBanner />
          <PWAInstallPrompt />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
