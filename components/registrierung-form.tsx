"use client"

import type React from "react"
import { useState } from "react"
import {
  User,
  Wrench,
  Phone,
  Lock,
  UserCircle,
  Eye,
  EyeOff,
  CheckCircle,
  Mail,
  Building2,
  MapPin,
  Car,
  Award,
  FileText,
  X,
  Zap,
  Droplets,
  Flame,
  Paintbrush,
  Trees,
  ShieldCheck,
  Hammer,
  Building,
  Home,
  UserCheck,
  ArrowRight,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

type UserRole = "kunde" | "handwerker"
type HandwerkerType = "einzelhandwerker" | "unternehmen" | null
type KundeType = "hausverwalter" | "eigentuemer" | "mieter" | null

const specializations = [
  { id: "elektrik", name: "Elektrik", icon: Zap },
  { id: "sanitaer", name: "Sanitär", icon: Droplets },
  { id: "heizung", name: "Heizung", icon: Flame },
  { id: "maler", name: "Maler", icon: Paintbrush },
  { id: "garten", name: "Garten", icon: Trees },
  { id: "sicherheit", name: "Sicherheit", icon: ShieldCheck },
  { id: "allgemein", name: "Allgemein", icon: Hammer },
]

export function RegistrierungForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = searchParams.get("role") as UserRole | null
  const fromJobs = searchParams.get("from") === "jobs"

  const [role, setRole] = useState<UserRole>(initialRole || (fromJobs ? "handwerker" : "kunde"))
  const [handwerkerType, setHandwerkerType] = useState<HandwerkerType>(null)
  const [kundeType, setKundeType] = useState<KundeType>(null)
  const [step, setStep] = useState(1)

  // Kunde form data
  const [kundeData, setKundeData] = useState({
    name: "",
    whatsapp: "", // Changed telefon to whatsapp
    email: "", // Added email
    passwort: "",
  })

  // Handwerker form data
  const [handwerkerData, setHandwerkerData] = useState({
    name: "",
    firmenname: "",
    email: "",
    telefon: "",
    passwort: "",
    specializations: [] as string[],
    workingHours: { start: "08:00", end: "18:00" },
    workingDays: ["mo", "di", "mi", "do", "fr"] as string[],
    serviceArea: "",
    hasVehicle: true,
    experience: "",
    qualifications: "",
    agreeTerms: false,
    agreeDataProcessing: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const validateKundeForm = () => {
    const newErrors: Record<string, string> = {}
    if (!kundeData.name.trim()) newErrors.name = "Bitte geben Sie Ihren Namen ein"
    if (!kundeData.whatsapp.trim() && !kundeData.email.trim()) {
      newErrors.contact = "Bitte geben Sie WhatsApp oder E-Mail ein"
    }
    if (!kundeData.passwort) newErrors.passwort = "Bitte geben Sie ein Passwort ein"
    else if (kundeData.passwort.length < 6) newErrors.passwort = "Das Passwort muss mindestens 6 Zeichen lang sein"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateHandwerkerStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!handwerkerData.name.trim()) newErrors.name = "Name ist erforderlich"
      if (handwerkerType === "unternehmen" && !handwerkerData.firmenname.trim()) {
        newErrors.firmenname = "Firmenname ist erforderlich"
      }
      if (!handwerkerData.email.trim()) newErrors.email = "E-Mail ist erforderlich"
      if (!handwerkerData.telefon.trim()) newErrors.telefon = "Telefonnummer ist erforderlich"
      if (!handwerkerData.passwort) newErrors.passwort = "Passwort ist erforderlich"
      else if (handwerkerData.passwort.length < 6) newErrors.passwort = "Mindestens 6 Zeichen"
      if (handwerkerData.specializations.length === 0) {
        newErrors.specializations = "Wählen Sie mindestens einen Fachbereich"
      }
    } else if (currentStep === 2) {
      if (!handwerkerData.serviceArea.trim()) newErrors.serviceArea = "Servicegebiet ist erforderlich"
    } else if (currentStep === 3) {
      if (!handwerkerData.agreeTerms) newErrors.agreeTerms = "Sie müssen den AGB zustimmen"
      if (!handwerkerData.agreeDataProcessing) newErrors.agreeDataProcessing = "Zustimmung erforderlich"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleKundeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateKundeForm()) return
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    router.push("/dashboard/kunde")
  }

  const handleHandwerkerNext = () => {
    if (validateHandwerkerStep(step)) {
      setStep(step + 1)
    }
  }

  const handleHandwerkerSubmit = async () => {
    if (!validateHandwerkerStep(3)) return
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)

    // Open WhatsApp with verification message
    const whatsappUrl = "https://wa.me/4915510415655?text=Registrierung%20abschließen"
    window.open(whatsappUrl, "_blank")

    // Redirect to home page after successful registration
    router.push("/")
  }

  const toggleSpecialization = (id: string) => {
    setHandwerkerData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(id)
        ? prev.specializations.filter((s) => s !== id)
        : [...prev.specializations, id],
    }))
  }

  const toggleWorkingDay = (day: string) => {
    setHandwerkerData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }))
  }


  // Role selection component
  const renderRoleSelection = () => (
    <div className="mb-8">
      <p className="text-sm font-medium text-foreground mb-3">Ich bin:</p>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => {
            setRole("kunde")
            setHandwerkerType(null)
            setKundeType(null)
            setStep(1)
          }}
          className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
            role === "kunde"
              ? "border-primary bg-primary/5 dark:bg-primary/10"
              : "border-border hover:border-primary/50 dark:bg-[#0f1512]"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors ${
              role === "kunde" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            <User className="w-6 h-6" />
          </div>
          <span className={`font-semibold ${role === "kunde" ? "text-primary" : "text-foreground"}`}>Kunde</span>
          <p className="text-xs text-muted-foreground mt-1">Ich suche Hilfe</p>
          {role === "kunde" && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setRole("handwerker")
            setKundeType(null)
          }}
          className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
            role === "handwerker"
              ? "border-primary bg-primary/5 dark:bg-primary/10"
              : "border-border hover:border-primary/50 dark:bg-[#0f1512]"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors ${
              role === "handwerker" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            <Wrench className="w-6 h-6" />
          </div>
          <span className={`font-semibold ${role === "handwerker" ? "text-primary" : "text-foreground"}`}>
            Handwerker
          </span>
          <p className="text-xs text-muted-foreground mt-1">Ich biete Hilfe an</p>
          {role === "handwerker" && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </button>
      </div>
    </div>
  )

  const renderKundeTypeSelection = () => (
    <div className="bg-card dark:bg-[#1a2420] rounded-2xl shadow-lg p-8">
      {renderRoleSelection()}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Kundentyp wählen:</h3>

        <button
          type="button"
          onClick={() => setKundeType("hausverwalter")}
          className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left ${
            kundeType === "hausverwalter"
              ? "border-primary bg-primary/5 dark:bg-primary/10"
              : "border-border hover:border-primary/50 dark:bg-[#0f1512]"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                kundeType === "hausverwalter" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              <Building className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Hausverwalter</h4>
              <p className="text-sm text-muted-foreground mt-1">Verwalten Sie mehrere Objekte</p>
            </div>
            <ArrowRight
              className={`w-5 h-5 ${kundeType === "hausverwalter" ? "text-primary" : "text-muted-foreground"}`}
            />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setKundeType("eigentuemer")}
          className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left ${
            kundeType === "eigentuemer"
              ? "border-primary bg-primary/5 dark:bg-primary/10"
              : "border-border hover:border-primary/50 dark:bg-[#0f1512]"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                kundeType === "eigentuemer" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              <Home className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Eigentümer</h4>
              <p className="text-sm text-muted-foreground mt-1">Für Ihre eigene Immobilie</p>
            </div>
            <ArrowRight
              className={`w-5 h-5 ${kundeType === "eigentuemer" ? "text-primary" : "text-muted-foreground"}`}
            />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setKundeType("mieter")}
          className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left ${
            kundeType === "mieter"
              ? "border-primary bg-primary/5 dark:bg-primary/10"
              : "border-border hover:border-primary/50 dark:bg-[#0f1512]"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                kundeType === "mieter" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Mieter</h4>
              <p className="text-sm text-muted-foreground mt-1">Schnelle Hilfe bei Problemen</p>
            </div>
            <ArrowRight className={`w-5 h-5 ${kundeType === "mieter" ? "text-primary" : "text-muted-foreground"}`} />
          </div>
        </button>
      </div>

      <p className="text-center text-muted-foreground mt-6">
        Schon registriert?{" "}
        <Link href="/anmelden" className="text-primary font-semibold hover:underline">
          Hier anmelden
        </Link>
      </p>
    </div>
  )

  // Kunde simple form (after type selection)
  const renderKundeForm = () => (
    <div className="bg-card dark:bg-[#1a2420] rounded-2xl shadow-lg p-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => setKundeType(null)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span>Zurück zur Auswahl</span>
      </button>

      {/* Show selected type */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-primary/5 dark:bg-primary/10 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
          {kundeType === "hausverwalter" && <Building className="w-5 h-5" />}
          {kundeType === "eigentuemer" && <Home className="w-5 h-5" />}
          {kundeType === "mieter" && <UserCheck className="w-5 h-5" />}
        </div>
        <div>
          <p className="font-semibold text-foreground">
            {kundeType === "hausverwalter" && "Hausverwalter"}
            {kundeType === "eigentuemer" && "Eigentümer"}
            {kundeType === "mieter" && "Mieter"}
          </p>
          <p className="text-xs text-muted-foreground">Registrierung als Kunde</p>
        </div>
      </div>

      <form onSubmit={handleKundeSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Name <span className="text-accent">*</span>
          </label>
          <div className="relative">
            <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              id="name"
              value={kundeData.name}
              onChange={(e) => {
                setKundeData({ ...kundeData, name: e.target.value })
                if (errors.name) setErrors({ ...errors, name: "" })
              }}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground ${
                errors.name ? "border-red-500 bg-red-50 dark:bg-red-950/30" : "border-border"
              }`}
              placeholder="Ihr vollständiger Name"
            />
          </div>
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-foreground mb-2">
            WhatsApp <span className="text-muted-foreground text-xs">(oder E-Mail unten)</span>
          </label>
          <div className="relative">
            <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
            <input
              type="tel"
              id="whatsapp"
              value={kundeData.whatsapp}
              onChange={(e) => {
                setKundeData({ ...kundeData, whatsapp: e.target.value })
                if (errors.contact) setErrors({ ...errors, contact: "" }) // Clear contact error if whatsapp is filled
              }}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground ${
                errors.contact ? "border-red-500 bg-red-50 dark:bg-red-950/30" : "border-border"
              }`}
              placeholder="+49 123 456789"
            />
          </div>
          {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            E-Mail <span className="text-muted-foreground text-xs">(alternativ)</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              id="email"
              value={kundeData.email}
              onChange={(e) => {
                setKundeData({ ...kundeData, email: e.target.value })
                if (errors.contact) setErrors({ ...errors, contact: "" }) // Clear contact error if email is filled
              }}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground ${
                errors.contact ? "border-red-500 bg-red-50 dark:bg-red-950/30" : "border-border"
              }`}
              placeholder="ihre@email.de"
            />
          </div>
          {/* Error message is already tied to errors.contact */}
        </div>

        <div>
          <label htmlFor="passwort" className="block text-sm font-medium text-foreground mb-2">
            Passwort <span className="text-accent">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              id="passwort"
              value={kundeData.passwort}
              onChange={(e) => {
                setKundeData({ ...kundeData, passwort: e.target.value })
                if (errors.passwort) setErrors({ ...errors, passwort: "" })
              }}
              className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground ${
                errors.passwort ? "border-red-500 bg-red-50 dark:bg-red-950/30" : "border-border"
              }`}
              placeholder="Mindestens 6 Zeichen"
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent text-white font-semibold py-4 rounded-full hover:bg-accent/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg mt-8"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Registrierung läuft...
            </>
          ) : (
            "Registrieren"
          )}
        </button>
      </form>

      <p className="text-center text-muted-foreground mt-6">
        Schon registriert?{" "}
        <Link href="/anmelden" className="text-primary font-semibold hover:underline">
          Hier anmelden
        </Link>
      </p>
    </div>
  )

  // Handwerker type selection
  const renderHandwerkerTypeSelection = () => (
    <div className="bg-card dark:bg-[#1a2420] rounded-2xl shadow-lg p-8">
      {renderRoleSelection()}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Registrierungsart wählen:</h3>

        <button
          type="button"
          onClick={() => setHandwerkerType("einzelhandwerker")}
          className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left ${
            handwerkerType === "einzelhandwerker"
              ? "border-primary bg-primary/5 dark:bg-primary/10"
              : "border-border hover:border-primary/50 dark:bg-[#0f1512]"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                handwerkerType === "einzelhandwerker" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Einzelhandwerker</h4>
              <p className="text-sm text-muted-foreground mt-1">Selbstständiger Handwerker ohne Firma</p>
            </div>
            {handwerkerType === "einzelhandwerker" && <CheckCircle className="w-6 h-6 text-primary" />}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setHandwerkerType("unternehmen")}
          className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left ${
            handwerkerType === "unternehmen"
              ? "border-primary bg-primary/5 dark:bg-primary/10"
              : "border-border hover:border-primary/50 dark:bg-[#0f1512]"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                handwerkerType === "unternehmen" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Handwerksunternehmen</h4>
              <p className="text-sm text-muted-foreground mt-1">Registriertes Unternehmen mit Mitarbeitern</p>
            </div>
            {handwerkerType === "unternehmen" && <CheckCircle className="w-6 h-6 text-primary" />}
          </div>
        </button>
      </div>

      <p className="text-center text-muted-foreground mt-6">
        Schon registriert?{" "}
        <Link href="/anmelden" className="text-primary font-semibold hover:underline">
          Hier anmelden
        </Link>
      </p>
    </div>
  )

  // Progress indicator for handwerker multi-step form
  const renderProgressBar = () => (
    <div className="flex items-center justify-between mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
              s <= step ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            {s < step ? <CheckCircle className="w-5 h-5" /> : s}
          </div>
          {s < 3 && <div className={`w-16 sm:w-24 h-1 mx-2 ${s < step ? "bg-primary" : "bg-muted"}`} />}
        </div>
      ))}
    </div>
  )

  // Handwerker Step 1: Basic Info
  const renderHandwerkerStep1 = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {handwerkerType === "unternehmen" ? "Ansprechpartner" : "Name"} <span className="text-accent">*</span>
          </label>
          <div className="relative">
            <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={handwerkerData.name}
              onChange={(e) => {
                setHandwerkerData({ ...handwerkerData, name: e.target.value })
                if (errors.name) setErrors({ ...errors, name: "" })
              }}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground ${
                errors.name ? "border-red-500" : "border-border"
              }`}
              placeholder="Vollständiger Name"
            />
          </div>
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {handwerkerType === "unternehmen" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Firmenname <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={handwerkerData.firmenname}
                onChange={(e) => {
                  setHandwerkerData({ ...handwerkerData, firmenname: e.target.value })
                  if (errors.firmenname) setErrors({ ...errors, firmenname: "" })
                }}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground ${
                  errors.firmenname ? "border-red-500" : "border-border"
                }`}
                placeholder="Name Ihres Unternehmens"
              />
            </div>
            {errors.firmenname && <p className="text-red-500 text-sm mt-1">{errors.firmenname}</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            E-Mail <span className="text-accent">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              value={handwerkerData.email}
              onChange={(e) => {
                setHandwerkerData({ ...handwerkerData, email: e.target.value })
                if (errors.email) setErrors({ ...errors, email: "" })
              }}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground ${
                errors.email ? "border-red-500" : "border-border"
              }`}
              placeholder="ihre@email.de"
            />
          </div>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Telefon <span className="text-accent">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="tel"
              value={handwerkerData.telefon}
              onChange={(e) => {
                setHandwerkerData({ ...handwerkerData, telefon: e.target.value })
                if (errors.telefon) setErrors({ ...errors, telefon: "" })
              }}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground ${
                errors.telefon ? "border-red-500" : "border-border"
              }`}
              placeholder="+49 123 456789"
            />
          </div>
          {errors.telefon && <p className="text-red-500 text-sm mt-1">{errors.telefon}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Passwort <span className="text-accent">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type={showPassword ? "text" : "password"}
            value={handwerkerData.passwort}
            onChange={(e) => {
              setHandwerkerData({ ...handwerkerData, passwort: e.target.value })
              if (errors.passwort) setErrors({ ...errors, passwort: "" })
            }}
            className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground ${
              errors.passwort ? "border-red-500" : "border-border"
            }`}
            placeholder="Mindestens 6 Zeichen"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.passwort && <p className="text-red-500 text-sm mt-1">{errors.passwort}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Fachbereiche <span className="text-accent">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {specializations.map((spec) => (
            <button
              key={spec.id}
              type="button"
              onClick={() => toggleSpecialization(spec.id)}
              className={`p-3 rounded-xl border-2 transition-all ${
                handwerkerData.specializations.includes(spec.id)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 text-muted-foreground dark:bg-[#0f1512]"
              }`}
            >
              <spec.icon className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium">{spec.name}</span>
            </button>
          ))}
        </div>
        {errors.specializations && <p className="text-red-500 text-sm mt-2">{errors.specializations}</p>}
      </div>
    </div>
  )

  // Handwerker Step 2: Availability
  const renderHandwerkerStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Arbeitszeiten</label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Von</label>
            <input
              type="time"
              value={handwerkerData.workingHours.start}
              onChange={(e) =>
                setHandwerkerData({
                  ...handwerkerData,
                  workingHours: { ...handwerkerData.workingHours, start: e.target.value },
                })
              }
              className="w-full p-3 rounded-xl border-2 border-border focus:border-primary focus:outline-none bg-background dark:bg-[#0f1512] text-foreground"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Bis</label>
            <input
              type="time"
              value={handwerkerData.workingHours.end}
              onChange={(e) =>
                setHandwerkerData({
                  ...handwerkerData,
                  workingHours: { ...handwerkerData.workingHours, end: e.target.value },
                })
              }
              className="w-full p-3 rounded-xl border-2 border-border focus:border-primary focus:outline-none bg-background dark:bg-[#0f1512] text-foreground"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Arbeitstage</label>
        <div className="flex flex-wrap gap-2">
          {["mo", "di", "mi", "do", "fr", "sa", "so"].map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleWorkingDay(day)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                handwerkerData.workingDays.includes(day)
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Servicegebiet (PLZ) <span className="text-accent">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={handwerkerData.serviceArea}
            onChange={(e) => {
              setHandwerkerData({ ...handwerkerData, serviceArea: e.target.value })
              if (errors.serviceArea) setErrors({ ...errors, serviceArea: "" })
            }}
            className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground ${
              errors.serviceArea ? "border-red-500" : "border-border"
            }`}
            placeholder="z.B. 10115, 10117, 10119"
          />
        </div>
        {errors.serviceArea && <p className="text-red-500 text-sm mt-1">{errors.serviceArea}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Fahrzeug vorhanden?</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setHandwerkerData({ ...handwerkerData, hasVehicle: true })}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              handwerkerData.hasVehicle
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 dark:bg-[#0f1512]"
            }`}
          >
            <Car
              className={`w-6 h-6 mx-auto mb-2 ${handwerkerData.hasVehicle ? "text-primary" : "text-muted-foreground"}`}
            />
            <span className={`text-sm font-medium ${handwerkerData.hasVehicle ? "text-primary" : "text-foreground"}`}>
              Ja
            </span>
          </button>
          <button
            type="button"
            onClick={() => setHandwerkerData({ ...handwerkerData, hasVehicle: false })}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              !handwerkerData.hasVehicle
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 dark:bg-[#0f1512]"
            }`}
          >
            <X
              className={`w-6 h-6 mx-auto mb-2 ${!handwerkerData.hasVehicle ? "text-primary" : "text-muted-foreground"}`}
            />
            <span className={`text-sm font-medium ${!handwerkerData.hasVehicle ? "text-primary" : "text-foreground"}`}>
              Nein
            </span>
          </button>
        </div>
      </div>
    </div>
  )

  // Handwerker Step 3: Verification
  const renderHandwerkerStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Berufserfahrung</label>
        <div className="relative">
          <Award className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
          <textarea
            value={handwerkerData.experience}
            onChange={(e) => setHandwerkerData({ ...handwerkerData, experience: e.target.value })}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border focus:border-primary focus:outline-none min-h-[100px] bg-background dark:bg-[#0f1512] text-foreground"
            placeholder="Beschreiben Sie Ihre Berufserfahrung..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Qualifikationen & Zertifikate</label>
        <div className="relative">
          <FileText className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
          <textarea
            value={handwerkerData.qualifications}
            onChange={(e) => setHandwerkerData({ ...handwerkerData, qualifications: e.target.value })}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border focus:border-primary focus:outline-none min-h-[80px] bg-background dark:bg-[#0f1512] text-foreground"
            placeholder="z.B. Meisterbrief, Gesellenbrief..."
          />
        </div>
      </div>


      <div className="space-y-3 pt-4 border-t border-border">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={handwerkerData.agreeTerms}
            onChange={(e) => {
              setHandwerkerData({ ...handwerkerData, agreeTerms: e.target.checked })
              if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: "" })
            }}
            className="w-5 h-5 rounded border-border text-primary focus:ring-primary mt-0.5"
          />
          <span className="text-sm text-muted-foreground">
            Ich akzeptiere die{" "}
            <Link href="/agb" className="text-primary hover:underline">
              AGB
            </Link>{" "}
            und{" "}
            <Link href="/datenschutz" className="text-primary hover:underline">
              Datenschutzerklärung
            </Link>
          </span>
        </label>
        {errors.agreeTerms && <p className="text-red-500 text-sm">{errors.agreeTerms}</p>}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={handwerkerData.agreeDataProcessing}
            onChange={(e) => {
              setHandwerkerData({ ...handwerkerData, agreeDataProcessing: e.target.checked })
              if (errors.agreeDataProcessing) setErrors({ ...errors, agreeDataProcessing: "" })
            }}
            className="w-5 h-5 rounded border-border text-primary focus:ring-primary mt-0.5"
          />
          <span className="text-sm text-muted-foreground">
            Ich stimme der Verarbeitung meiner Daten zur Vermittlung von Aufträgen zu
          </span>
        </label>
        {errors.agreeDataProcessing && <p className="text-red-500 text-sm">{errors.agreeDataProcessing}</p>}
      </div>

      {/* WhatsApp verification instruction */}
      <div className="mt-6 p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
        <p className="text-sm text-muted-foreground text-center">
          Schreiben Sie uns in WhatsApp "Registrierung abschließen".
        </p>
      </div>
    </div>
  )

  // Handwerker multi-step form
  const renderHandwerkerForm = () => (
    <div className="bg-card dark:bg-[#1a2420] rounded-2xl shadow-lg p-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => {
          if (step > 1) {
            setStep(step - 1)
          } else {
            setHandwerkerType(null)
          }
        }}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span>{step > 1 ? "Zurück" : "Zurück zur Auswahl"}</span>
      </button>

      {renderProgressBar()}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground">
          {step === 1 && "Grunddaten"}
          {step === 2 && "Verfügbarkeit"}
          {step === 3 && "Verifizierung"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {step === 1 && "Geben Sie Ihre grundlegenden Informationen ein"}
          {step === 2 && "Legen Sie Ihre Arbeitszeiten und Servicegebiet fest"}
          {step === 3 && "Bestätigen Sie Ihre Qualifikationen"}
        </p>
      </div>

      {step === 1 && renderHandwerkerStep1()}
      {step === 2 && renderHandwerkerStep2()}
      {step === 3 && renderHandwerkerStep3()}

      <div className="flex gap-4 mt-8">
        {step < 3 ? (
          <button
            type="button"
            onClick={handleHandwerkerNext}
            className="flex-1 bg-primary text-white font-semibold py-4 rounded-full hover:bg-primary/90 transition-all"
          >
            Weiter
          </button>
        ) : (
          <button
            type="button"
            onClick={handleHandwerkerSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-accent text-white font-semibold py-4 rounded-full hover:bg-accent/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Registrierung läuft...
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4 mr-2" />
                Registrierung abschließen in WhatsApp
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="w-full">
      {role === "kunde" && !kundeType && renderKundeTypeSelection()}
      {role === "kunde" && kundeType && renderKundeForm()}
      {role === "handwerker" && !handwerkerType && renderHandwerkerTypeSelection()}
      {role === "handwerker" && handwerkerType && renderHandwerkerForm()}
    </div>
  )
}
