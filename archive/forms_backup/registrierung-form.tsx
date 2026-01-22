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
  ArrowRight,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { VerificationPopup, SuccessPopup } from "@/components/verification-popup"
import { generateMasterRegistrationLink } from "@/lib/source-codes"

type HandwerkerType = "einzelhandwerker" | null

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

  const [handwerkerType, setHandwerkerType] = useState<HandwerkerType>(null)
  const [step, setStep] = useState(1)


  // Handwerker form data
  const [handwerkerData, setHandwerkerData] = useState({
    vorname: "",
    nachname: "",
    email: "",
    whatsapp: "",
    passwort: "",
    specializations: [] as string[],
    workingHours: { start: "08:00", end: "18:00" },
    workingDays: {
      mo: true,
      di: true,
      mi: true,
      do: true,
      fr: true,
      sa: false,
      so: false
    } as Record<string, boolean>,
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
  const [showVerification, setShowVerification] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)


  const validateHandwerkerStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!handwerkerData.vorname.trim()) newErrors.vorname = "Vorname ist erforderlich"
      if (!handwerkerData.nachname.trim()) newErrors.nachname = "Nachname ist erforderlich"
      if (!handwerkerData.email.trim()) newErrors.email = "E-Mail ist erforderlich"
      if (!handwerkerData.whatsapp.trim()) newErrors.whatsapp = "WhatsApp-Nummer ist erforderlich"
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


  const handleHandwerkerNext = () => {
    if (validateHandwerkerStep(step)) {
      setStep(step + 1)
    }
  }

  const sendToWebhook = async (webhookUrl: string, data: any) => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        console.error(`Webhook failed for ${webhookUrl}:`, response.status)
      } else {
        console.log(`Webhook success for ${webhookUrl}`)
      }
    } catch (error) {
      console.error(`Webhook error for ${webhookUrl}:`, error)
    }
  }

  const handleHandwerkerSubmit = async () => {
    if (!validateHandwerkerStep(3)) return
    setIsSubmitting(true)

    // Prepare data for webhook
    const webhookData = {
      vorname: handwerkerData.vorname,
      nachname: handwerkerData.nachname,
      email: handwerkerData.email,
      whatsapp: handwerkerData.whatsapp,
      specializations: handwerkerData.specializations,
      workingHours: handwerkerData.workingHours,
      workingDays: handwerkerData.workingDays,
      serviceArea: handwerkerData.serviceArea,
      hasVehicle: handwerkerData.hasVehicle,
      experience: handwerkerData.experience,
      qualifications: handwerkerData.qualifications,
      registrationType: 'einzelhandwerker',
      timestamp: new Date().toISOString(),
      source: 'website_registration'
    }

    // Send to production webhook
    await sendToWebhook('https://assetcare24.org/webhook/d509d181-13ab-4c34-b192-4b8994ec9e49', webhookData)

    // Send to test webhook
    await sendToWebhook('https://assetcare24.org/webhook-test/d509d181-13ab-4c34-b192-4b8994ec9e49', webhookData)

    setIsSubmitting(false)

    // Open WhatsApp with new source code tracking
    const whatsappUrl = generateMasterRegistrationLink("14155238886")
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

  const handleVerificationSuccess = () => {
    setShowVerification(false)
    setShowSuccess(true)
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    // Redirect to jobs page
    router.push("/jobs")
  }

  const toggleWorkingDay = (day: string) => {
    setHandwerkerData((prev) => ({
      ...prev,
      workingDays: {
        ...prev.workingDays,
        [day]: !prev.workingDays[day]
      },
    }))
  }





  // Handwerker type selection
  const renderHandwerkerTypeSelection = () => (
    <div className="bg-card dark:bg-[#1a2420] rounded-2xl shadow-lg p-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Registrierungsart wählen:</h3>

        <button
          type="button"
          onClick={() => setHandwerkerType("einzelhandwerker")}
          className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left border-primary bg-primary/5 dark:bg-primary/10`}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Einzelhandwerker</h4>
              <p className="text-sm text-muted-foreground mt-1">Selbstständiger Handwerker ohne Firma</p>
            </div>
            <CheckCircle className="w-6 h-6 text-primary" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => router.push("/firma-registrieren")}
          className="w-full p-6 rounded-xl border-2 transition-all duration-300 text-left border-primary bg-primary/5 dark:bg-primary/10 hover:border-primary/80"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Handwerksunternehmen</h4>
              <p className="text-sm text-muted-foreground mt-1">Registriertes Unternehmen mit Mitarbeitern</p>
            </div>
            <CheckCircle className="w-6 h-6 text-primary" />
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
            Vorname <span className="text-accent">*</span>
          </label>
          <div className="relative">
            <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={handwerkerData.vorname}
              onChange={(e) => {
                setHandwerkerData({ ...handwerkerData, vorname: e.target.value })
                if (errors.vorname) setErrors({ ...errors, vorname: "" })
              }}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground ${
                errors.vorname ? "border-red-500" : "border-border"
              }`}
              placeholder="Vorname"
            />
          </div>
          {errors.vorname && <p className="text-red-500 text-sm mt-1">{errors.vorname}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Nachname <span className="text-accent">*</span>
          </label>
          <div className="relative">
            <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={handwerkerData.nachname}
              onChange={(e) => {
                setHandwerkerData({ ...handwerkerData, nachname: e.target.value })
                if (errors.nachname) setErrors({ ...errors, nachname: "" })
              }}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground ${
                errors.nachname ? "border-red-500" : "border-border"
              }`}
              placeholder="Nachname"
            />
          </div>
          {errors.nachname && <p className="text-red-500 text-sm mt-1">{errors.nachname}</p>}
        </div>
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
            WhatsApp <span className="text-accent">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="tel"
              value={handwerkerData.whatsapp}
              onChange={(e) => {
                setHandwerkerData({ ...handwerkerData, whatsapp: e.target.value })
                if (errors.whatsapp) setErrors({ ...errors, whatsapp: "" })
              }}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground ${
                errors.whatsapp ? "border-red-500" : "border-border"
              }`}
              placeholder="+49 123 456789"
            />
          </div>
          {errors.whatsapp && <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>}
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
                handwerkerData.workingDays[day]
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

  // Main render logic
  return (
    <>
      {handwerkerType ? renderHandwerkerForm() : renderHandwerkerTypeSelection()}

      {/* Popup components outside the main content */}
      <VerificationPopup
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        onVerify={handleVerificationSuccess}
      />

      <SuccessPopup
        isOpen={showSuccess}
        onClose={handleSuccessClose}
      />
    </>
  )
}
