"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  { label: "Startseite", href: "/" },
  { label: "Leistungen", href: "/leistungen" },
  { label: "Jobs", href: "/jobs" },
  { label: "Kontakt", href: "/#kontakt" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [screenWidth, setScreenWidth] = useState(1400)
  const pathname = usePathname()

  const isLoggedIn = pathname.startsWith("/dashboard")

  const showHamburger = screenWidth < 1200
  const showDesktopNav = screenWidth >= 1200

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href.split("#")[0]) && href.split("#")[0] !== "/"
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.includes("#")) {
      const hash = href.split("#")[1]
      const basePath = href.split("#")[0] || "/"

      if (pathname === basePath || (basePath === "/" && pathname === "/")) {
        e.preventDefault()
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      }
    }
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    const checkWidth = () => {
      setScreenWidth(window.innerWidth)
    }
    checkWidth()
    window.addEventListener("resize", checkWidth)
    return () => window.removeEventListener("resize", checkWidth)
  }, [])

  useEffect(() => {
    if (!showHamburger) {
      setMobileMenuOpen(false)
    }
  }, [showHamburger])

  const allNavItems = isLoggedIn
    ? [
        ...navItems,
        { label: "Mein Konto", href: pathname.includes("handwerker") ? "/dashboard/handwerker" : "/dashboard/kunde" },
      ]
    : navItems

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-24 sm:h-28 items-center justify-between">
          <Link href="/" className="flex-shrink-0 flex flex-col" onClick={handleLogoClick}>
            <Image
              src="/images/logo.png"
              alt="AssetCare24 - Mein Zuhause"
              width={420}
              height={105}
              className="h-16 sm:h-20 lg:h-24 w-auto dark:brightness-0 dark:invert"
              priority
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 font-medium">
              Ihr zuverlässiger Haushalts-Service
            </span>
          </Link>

          {/* Desktop navigation - only show at 1200px+ */}
          {showDesktopNav && (
            <nav className="flex items-center gap-5 xl:gap-7">
              {allNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`text-sm xl:text-base font-medium transition-colors duration-200 whitespace-nowrap ${
                    isActive(item.href) ? "text-accent" : "text-primary hover:text-accent"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Button
                asChild
                variant="ghost"
                className="text-primary hover:bg-primary/10 font-semibold px-4 py-2.5 text-sm transition-all duration-200"
              >
                <Link href="/anmelden">Anmelden</Link>
              </Button>
            </nav>
          )}

          <div className="flex items-center gap-2 lg:gap-3">
            <ThemeToggle />

            {/* WhatsApp icon button - show on tablet and desktop */}
            {screenWidth >= 640 && (
              <a
                href="https://wa.me/4915510415655"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#128C7E] transition-colors duration-200"
                aria-label="WhatsApp Kontakt"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            )}

            {/* Desktop buttons - only show at 1200px+ */}
            {showDesktopNav && (
              <>
                <Button
                  asChild
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-5 py-2.5 text-sm transition-all duration-200 bg-transparent"
                >
                  <Link href="/registrierung">Registrieren</Link>
                </Button>

                <Button
                  asChild
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-5 lg:px-6 py-2.5 text-sm lg:text-base transition-all duration-200 hover:scale-105"
                >
                  <Link href="/meldung">Service anfragen</Link>
                </Button>
              </>
            )}

            {showHamburger && (
              <button
                className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menü öffnen"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>

        {mobileMenuOpen && showHamburger && (
          <div className="py-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-2">
              {allNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`text-base font-medium transition-colors duration-200 py-3 px-2 rounded-lg ${
                    isActive(item.href)
                      ? "text-accent bg-accent/10"
                      : "text-primary hover:text-accent hover:bg-primary/5"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
                {/* WhatsApp button in mobile menu */}
                <a
                  href="https://wa.me/4915510415655"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-lg bg-[#25D366] hover:bg-[#128C7E] text-white font-medium transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
                <Button asChild variant="ghost" className="w-full text-primary hover:bg-primary/10 h-12 text-base">
                  <Link href="/anmelden">Anmelden</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent h-12 text-base"
                >
                  <Link href="/registrierung">Registrieren</Link>
                </Button>
                <Button
                  asChild
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium w-full h-12 text-base"
                >
                  <Link href="/meldung">Service anfragen</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
