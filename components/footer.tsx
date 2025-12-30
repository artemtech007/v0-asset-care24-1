"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

const navigationLinks = [
  { label: "Startseite", href: "/" },
  { label: "Leistungen", href: "/leistungen" },
  { label: "Jobs", href: "/jobs" },
  { label: "Kundenmeinungen", href: "/#kundenmeinungen" },
  { label: "Kontakt", href: "/#kontakt" },
]

const customerLinks = [
  { label: "Service anfragen", href: "/meldung" },
  { label: "Registrieren", href: "/registrierung?role=kunde" },
  { label: "Hilfe", href: "/#kontakt" },
]

const craftsmanLinks = [
  { label: "Registrieren", href: "/registrierung?role=handwerker" },
  { label: "Jobs", href: "/jobs" },
  { label: "Mein Konto", href: "/anmelden" },
]

export function Footer() {
  const pathname = usePathname()

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <footer id="kontakt" className="bg-[#004728] dark:bg-[#001f12] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand - takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block" onClick={handleLogoClick}>
              <Image
                src="/images/logo.png"
                alt="AssetCare24 - Mein Zuhause"
                width={200}
                height={50}
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="mt-2 text-lg font-medium text-white">Ihr zuverlässiger Haushalts-Service</p>
            <p className="mt-3 text-white/80 leading-relaxed">
              Ihr Zuhause – unsere Sorge. Alles übersichtlich, transparent und bequem.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <nav className="flex flex-col gap-3">
              {navigationLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-white/80 hover:text-accent transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Für Kunden</h3>
            <nav className="flex flex-col gap-3">
              {customerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-white/80 hover:text-accent transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Für Handwerker</h3>
            <nav className="flex flex-col gap-3">
              {craftsmanLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-white/80 hover:text-accent transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Contact info */}
            <div className="flex flex-wrap items-center gap-6 text-white/80">
              <a
                href="mailto:info@assetcare24.de"
                className="flex items-center gap-2 hover:text-accent transition-colors duration-200"
              >
                <Mail className="h-4 w-4" />
                <span>info@assetcare24.de</span>
              </a>
              <a
                href="tel:+4930123456789"
                className="flex items-center gap-2 hover:text-accent transition-colors duration-200"
              >
                <Phone className="h-4 w-4" />
                <span>+49 30 123 456 789</span>
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Berlin</span>
              </div>
            </div>

            {/* Legal links */}
            <div className="flex gap-6 text-sm">
              <Link href="/impressum" className="text-white/60 hover:text-accent transition-colors duration-200">
                Impressum
              </Link>
              <Link href="/datenschutz" className="text-white/60 hover:text-accent transition-colors duration-200">
                Datenschutz
              </Link>
            </div>
          </div>

          {/* Copyright */}
          <p className="mt-6 text-white/60 text-sm text-center lg:text-left">
            © 2025 AssetCare24. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  )
}
