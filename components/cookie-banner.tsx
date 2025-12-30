"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Cookie, Settings, Shield } from "lucide-react"

type CookieConsent = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const savedConsent = localStorage.getItem("cookie-consent")
    if (!savedConsent) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const saveConsent = (newConsent: CookieConsent) => {
    localStorage.setItem("cookie-consent", JSON.stringify(newConsent))
    localStorage.setItem("cookie-consent-date", new Date().toISOString())
    setIsVisible(false)
  }

  const acceptAll = () => {
    const allConsent = { necessary: true, analytics: true, marketing: true }
    setConsent(allConsent)
    saveConsent(allConsent)
  }

  const acceptSelected = () => {
    saveConsent(consent)
  }

  const rejectAll = () => {
    const minConsent = { necessary: true, analytics: false, marketing: false }
    setConsent(minConsent)
    saveConsent(minConsent)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto" onClick={() => {}} />

      {/* Banner */}
      <div className="relative w-full max-w-2xl bg-card dark:bg-[#1a2420] border border-border rounded-2xl shadow-2xl pointer-events-auto mb-4 animate-in slide-in-from-bottom-4 duration-500">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Cookie className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Cookie-Einstellungen</h3>
                <p className="text-sm text-muted-foreground">DSGVO-konform</p>
              </div>
            </div>
            <button onClick={rejectAll} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <p className="text-sm text-muted-foreground mb-4">
            Wir verwenden Cookies, um Ihnen die bestmogliche Erfahrung auf unserer Website zu bieten. Einige Cookies
            sind fur den Betrieb der Website erforderlich, wahrend andere uns helfen, die Website zu verbessern und
            Ihnen personalisierte Inhalte anzuzeigen.
          </p>

          {/* Settings Panel */}
          {showSettings && (
            <div className="space-y-3 mb-4 p-4 bg-background dark:bg-[#0f1512] rounded-xl">
              {/* Necessary */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Notwendige Cookies</span>
                </div>
                <div className="w-10 h-6 bg-primary rounded-full flex items-center justify-end px-1">
                  <div className="w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Erforderlich fur den Betrieb der Website. Kann nicht deaktiviert werden.
              </p>

              {/* Analytics */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Analyse-Cookies</span>
                </div>
                <button
                  onClick={() => setConsent((prev) => ({ ...prev, analytics: !prev.analytics }))}
                  className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                    consent.analytics ? "bg-primary justify-end" : "bg-muted justify-start"
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Helfen uns zu verstehen, wie Besucher unsere Website nutzen.
              </p>

              {/* Marketing */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Cookie className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">Marketing-Cookies</span>
                </div>
                <button
                  onClick={() => setConsent((prev) => ({ ...prev, marketing: !prev.marketing }))}
                  className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                    consent.marketing ? "bg-primary justify-end" : "bg-muted justify-start"
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Werden verwendet, um Ihnen relevante Werbung anzuzeigen.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={acceptAll} className="flex-1 bg-primary hover:bg-primary/90 text-white">
              Alle akzeptieren
            </Button>
            {showSettings ? (
              <Button onClick={acceptSelected} variant="outline" className="flex-1 bg-transparent">
                Auswahl speichern
              </Button>
            ) : (
              <Button onClick={() => setShowSettings(true)} variant="outline" className="flex-1">
                Einstellungen
              </Button>
            )}
            <Button onClick={rejectAll} variant="ghost" className="flex-1">
              Nur notwendige
            </Button>
          </div>

          {/* Links */}
          <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <a href="/datenschutz" className="hover:text-primary transition-colors">
              Datenschutzerklarung
            </a>
            <a href="/impressum" className="hover:text-primary transition-colors">
              Impressum
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
