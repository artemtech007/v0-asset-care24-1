"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, MessageCircle } from "lucide-react"

interface VerificationPopupProps {
  isOpen: boolean
  onClose: () => void
  onVerify: () => void
}

interface SuccessPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function VerificationPopup({ isOpen, onClose, onVerify }: Omit<VerificationPopupProps, 'contactMethod'>) {
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerify = () => {
    // Redirect to WhatsApp with verification message
    const whatsappUrl = "https://wa.me/4915510415655?text=Ich%20möchte%20meine%20Registrierung%20bestätigen"
    window.open(whatsappUrl, "_blank")
    // Don't call onVerify() to avoid auto-opening success popup
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Konto bestätigen</DialogTitle>
          <DialogDescription className="text-center">
            Schreiben Sie uns in WhatsApp "Registrierung abschließen".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Verify button */}
          <Button
            onClick={handleVerify}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            In WhatsApp bestätigen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SuccessPopup({ isOpen, onClose }: SuccessPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-center text-xl">Herzlich willkommen!</DialogTitle>
          <DialogDescription className="text-center">
            Ihre Registrierung wurde erfolgreich abgeschlossen. Sie können sich jetzt in Ihrem persönlichen Bereich anmelden.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center pt-4">
          <Button onClick={onClose} className="w-full bg-primary hover:bg-primary/90">
            Zum Login
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
