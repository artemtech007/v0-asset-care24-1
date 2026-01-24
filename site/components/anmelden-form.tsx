"use client"

import type React from "react"
import { useState } from "react"
import { User, Wrench, Building2, Phone, Lock, Eye, EyeOff, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type UserRole = "kunde" | "handwerker" | "admin"

const TEST_ACCOUNTS = [
  {
    role: "kunde" as UserRole,
    label: "Kunde",
    telefon: "+49 100 000001",
    passwort: "kunde123",
    dashboard: "/dashboard/kunde",
  },
  {
    role: "handwerker" as UserRole,
    label: "Handwerker",
    telefon: "+49 100 000002",
    passwort: "handwerker123",
    dashboard: "/dashboard/kunde",
  },
  {
    role: "admin" as UserRole,
    label: "Administrator",
    telefon: "+49 100 000000",
    passwort: "admin123",
    dashboard: "/dashboard/admin",
  },
]

export function AnmeldenForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    telefon: "",
    passwort: "",
  })
  const [role, setRole] = useState<UserRole>("kunde")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.telefon.trim()) {
      newErrors.telefon = "Bitte geben Sie Ihre Telefonnummer ein"
    }

    if (!formData.passwort) {
      newErrors.passwort = "Bitte geben Sie Ihr Passwort ein"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)

    if (role === "admin") {
      router.push("/dashboard/admin")
    } else {
      router.push("/dashboard/kunde")
    }
  }

  const handleTestLogin = (account: (typeof TEST_ACCOUNTS)[0]) => {
    setFormData({ telefon: account.telefon, passwort: account.passwort })
    setRole(account.role)

    // Auto-submit after short delay
    setTimeout(() => {
      router.push(account.dashboard)
    }, 500)
  }

  return (
    <div className="bg-card dark:bg-[#1a2420] rounded-2xl shadow-lg p-8">
      <div className="mb-6 p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
        <p className="text-sm font-semibold text-primary mb-3">Test-Zugangsdaten:</p>
        <div className="space-y-2">
          {TEST_ACCOUNTS.map((account) => (
            <button
              key={account.role}
              type="button"
              onClick={() => handleTestLogin(account)}
              className="w-full flex items-center justify-between p-3 bg-background dark:bg-[#0f1512] rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors text-left border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {account.role === "kunde" && <User className="w-4 h-4 text-primary" />}
                  {account.role === "handwerker" && <Wrench className="w-4 h-4 text-primary" />}
                  {account.role === "admin" && <Shield className="w-4 h-4 text-primary" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{account.label}</p>
                  <p className="text-xs text-muted-foreground">{account.telefon}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{account.passwort}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Role Selection - Added admin role option */}
      <div className="mb-8">
        <p className="text-sm font-medium text-foreground mb-3">Ich bin:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setRole("kunde")}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
              role === "kunde"
                ? "border-primary bg-primary/5 dark:bg-primary/10"
                : "border-border hover:border-primary/50 dark:bg-[#0f1512]"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors ${
                role === "kunde" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              <User className="w-5 h-5" />
            </div>
            <span className={`font-semibold text-sm ${role === "kunde" ? "text-primary" : "text-foreground"}`}>
              Kunde
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRole("handwerker")}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
              role === "handwerker"
                ? "border-primary bg-primary/5 dark:bg-primary/10"
                : "border-border hover:border-primary/50 dark:bg-[#0f1512]"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors ${
                role === "handwerker" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              <Wrench className="w-5 h-5" />
            </div>
            <span className={`font-semibold text-sm ${role === "handwerker" ? "text-primary" : "text-foreground"}`}>
              Handwerker
            </span>
          </button>


          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
              role === "admin"
                ? "border-primary bg-primary/5 dark:bg-primary/10"
                : "border-border hover:border-primary/50 dark:bg-[#0f1512]"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors ${
                role === "admin" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              <Shield className="w-5 h-5" />
            </div>
            <span className={`font-semibold text-sm ${role === "admin" ? "text-primary" : "text-foreground"}`}>
              Admin
            </span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Phone Field */}
        <div>
          <label htmlFor="telefon" className="block text-sm font-medium text-foreground mb-2">
            Telefonnummer <span className="text-accent">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="tel"
              id="telefon"
              value={formData.telefon}
              onChange={(e) => {
                setFormData({ ...formData, telefon: e.target.value })
                if (errors.telefon) setErrors({ ...errors, telefon: "" })
              }}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground ${
                errors.telefon ? "border-red-500 bg-red-50 dark:bg-red-950/30" : "border-border"
              }`}
              placeholder="+49 123 456789"
            />
          </div>
          {errors.telefon && <p className="text-red-500 text-sm mt-1">{errors.telefon}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="passwort" className="block text-sm font-medium text-foreground mb-2">
            Passwort <span className="text-accent">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              id="passwort"
              value={formData.passwort}
              onChange={(e) => {
                setFormData({ ...formData, passwort: e.target.value })
                if (errors.passwort) setErrors({ ...errors, passwort: "" })
              }}
              className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground ${
                errors.passwort ? "border-red-500 bg-red-50 dark:bg-red-950/30" : "border-border"
              }`}
              placeholder="Ihr Passwort"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.passwort && <p className="text-red-500 text-sm mt-1">{errors.passwort}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent text-white font-semibold py-4 rounded-full hover:bg-accent/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg mt-8"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Anmeldung läuft...
            </>
          ) : (
            "Anmelden"
          )}
        </button>
      </form>

      {/* Registration Link */}
      <p className="text-center text-muted-foreground mt-6">
        Noch kein Konto?{" "}
        <Link href="/registrierung" className="text-primary font-semibold hover:underline">
          Jetzt registrieren
        </Link>
      </p>
    </div>
  )
}
