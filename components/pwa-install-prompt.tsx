"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isDismissed, setIsDismissed] = useState(true) // Start as true to prevent flash

  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-prompt-dismissed")
    if (dismissed === "true") {
      setIsDismissed(true)
      return
    }
    setIsDismissed(false)

    // Check if already installed
    const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches
    if (isInStandaloneMode) {
      setIsDismissed(true)
      return
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)

    if (isIOSDevice) {
      setIsIOS(true)
      setTimeout(() => setIsVisible(true), 5000)
      return
    }

    // For Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setIsVisible(true), 5000)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        localStorage.setItem("pwa-prompt-dismissed", "true")
        setIsDismissed(true)
        setIsVisible(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem("pwa-prompt-dismissed", "true")
    setIsDismissed(true)
    setIsVisible(false)
  }

  if (!isVisible || isDismissed) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card dark:bg-[#1a2420] border border-border rounded-xl shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h4 className="font-semibold text-foreground text-sm">App installieren</h4>
              <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isIOS
                ? "Tippen Sie auf 'Teilen' und dann 'Zum Home-Bildschirm'."
                : "Installieren Sie AssetCare24 für schnellen Zugriff."}
            </p>
            {!isIOS && (
              <Button
                onClick={handleInstall}
                size="sm"
                className="mt-2 w-full bg-primary hover:bg-primary/90 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Installieren
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
