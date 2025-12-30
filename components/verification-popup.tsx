"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MessageCircle, Mail, Shield, CheckCircle } from "lucide-react"

interface VerificationPopupProps {
  isOpen: boolean
  onClose: () => void
  onVerify: () => void
  contactMethod: "whatsapp" | "email"
}

export function VerificationPopup({ isOpen, onClose, onVerify, contactMethod }: VerificationPopupProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError("")

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerify = async () => {
    const fullCode = code.join("")
    if (fullCode.length !== 6) {
      setError("Bitte geben Sie den vollständigen Code ein")
      return
    }

    setIsVerifying(true)
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // For demo, accept any 6-digit code
    setIsVerifying(false)
    onVerify()
  }

  const handleResend = () => {
    if (resendCooldown > 0) return
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSkip = () => {
    onClose()
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
            Geben Sie den Bestätigungscode ein, den wir Ihnen per {contactMethod === "whatsapp" ? "WhatsApp" : "E-Mail"}{" "}
            gesendet haben, um Zugriff auf die Funktionen Ihres persönlichen Bereichs zu erhalten.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Contact method indicator */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {contactMethod === "whatsapp" ? (
              <MessageCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Mail className="h-4 w-4 text-primary" />
            )}
            <span>Code gesendet an {contactMethod === "whatsapp" ? "WhatsApp" : "E-Mail"}</span>
          </div>

          {/* Code input */}
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-semibold border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Verify button */}
          <Button
            onClick={handleVerify}
            disabled={isVerifying || code.join("").length !== 6}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isVerifying ? (
              "Wird überprüft..."
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Bestätigen
              </>
            )}
          </Button>

          {/* Resend code */}
          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              {resendCooldown > 0 ? `Code erneut senden (${resendCooldown}s)` : "Code erneut senden"}
            </button>
          </div>

          {/* Skip for now */}
          <div className="text-center border-t pt-4">
            <button onClick={handleSkip} className="text-sm text-muted-foreground hover:text-foreground">
              Später bestätigen
            </button>
            <p className="text-xs text-muted-foreground mt-1">Einige Funktionen sind ohne Bestätigung eingeschränkt</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
