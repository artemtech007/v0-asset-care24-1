"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Zap,
  Droplets,
  Flame,
  Paintbrush,
  Trees,
  Shield,
  Hammer,
  UserCircle,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  MessageCircle,
  Building2,
} from "lucide-react"
import { generateCompanyRegistrationLink } from "@/lib/source-codes"

type Step = 1 | 2 | 3

const specializations = [
  { id: "elektrik", name: "Elektrik", icon: Zap },
  { id: "sanitaer", name: "Sanitär", icon: Droplets },
  { id: "heizung", name: "Heizung", icon: Flame },
  { id: "maler", name: "Maler", icon: Paintbrush },
  { id: "garten", name: "Garten", icon: Trees },
  { id: "sicherheit", name: "Sicherheit", icon: Shield },
  { id: "allgemein", name: "Allgemein", icon: Hammer },
]

export function FirmaRegistrierungForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    firmenname: "",
    vorname: "",
    nachname: "",
    email: "",
    whatsapp: "",
    passwort: "",
    specializations: [] as string[],
    workingHours: { start: "08:00", end: "18:00" },
    workingDays: {
      mo: true, di: true, mi: true, do: true, fr: true, sa: false, so: false
    } as Record<string, boolean>,
    serviceArea: "",
    hasVehicle: true,
    experience: "",
    qualifications: "",
    agreeTerms: false,
    agreeDataProcessing: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateFormData = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const toggleSpecialization = (id: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(id)
        ? prev.specializations.filter(s => s !== id)
        : [...prev.specializations, id],
    }))
  }

  const toggleWorkingDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workingDays: {
        ...prev.workingDays,
        [day]: !prev.workingDays[day]
      },
    }))
  }

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.firmenname.trim()) newErrors.firmenname = "Firmenname ist erforderlich"
      if (!formData.vorname.trim()) newErrors.vorname = "Vorname des Vertreters ist erforderlich"
      if (!formData.nachname.trim()) newErrors.nachname = "Nachname des Vertreters ist erforderlich"
      if (!formData.email.trim()) newErrors.email = "E-Mail ist erforderlich"
      if (!formData.whatsapp.trim()) newErrors.whatsapp = "WhatsApp-Nummer ist erforderlich"
      if (!formData.passwort) newErrors.passwort = "Passwort ist erforderlich"
      else if (formData.passwort.length < 6) newErrors.passwort = "Mindestens 6 Zeichen"
      if (formData.specializations.length === 0) {
        newErrors.specializations = "Wählen Sie mindestens einen Fachbereich"
      }
    } else if (step === 2) {
      if (!formData.serviceArea.trim()) newErrors.serviceArea = "Servicegebiet ist erforderlich"
    } else if (step === 3) {
      if (!formData.agreeTerms) newErrors.agreeTerms = "Sie müssen den AGB zustimmen"
      if (!formData.agreeDataProcessing) newErrors.agreeDataProcessing = "Zustimmung erforderlich"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => (prev + 1) as Step)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as Step)
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

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    setIsSubmitting(true)

    const webhookData = {
      firmenname: formData.firmenname,
      vorname: formData.vorname,
      nachname: formData.nachname,
      email: formData.email,
      whatsapp: formData.whatsapp,
      specializations: formData.specializations,
      workingHours: formData.workingHours,
      workingDays: formData.workingDays,
      serviceArea: formData.serviceArea,
      hasVehicle: formData.hasVehicle,
      experience: formData.experience,
      qualifications: formData.qualifications,
      registrationType: 'unternehmen',
      timestamp: new Date().toISOString(),
      source: 'website_registration'
    }

    // Open WhatsApp immediately (synchronous)
    const whatsappUrl = generateCompanyRegistrationLink("14155238886")
    window.open(whatsappUrl, "_blank")

    setIsSubmitting(false)
    router.push("/")

    // Send webhooks asynchronously after UI updates
    sendToWebhook('https://assetcare24.org/webhook/d509d181-13ab-4c34-b192-4b8994ec9e49', webhookData)
    sendToWebhook('https://assetcare24.org/webhook-test/d509d181-13ab-4c34-b192-4b8994ec9e49', webhookData)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Schritt {currentStep}/3: {
              currentStep === 1 ? "Grunddaten" :
              currentStep === 2 ? "Verfügbarkeit" : "Verifizierung"
            }
          </span>
          <span className="text-sm text-muted-foreground">{Math.round((currentStep / 3) * 100)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
               style={{ width: `${(currentStep / 3) * 100}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex items-center gap-1 text-xs ${
              s <= currentStep ? "text-primary" : "text-muted-foreground"
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                s <= currentStep ? "bg-primary text-white" : "bg-muted"
              }`}>
                {s < currentStep ? "✓" : s}
              </div>
              {s === 1 ? "Grunddaten" : s === 2 ? "Verfügbarkeit" : "Verifizierung"}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card dark:bg-[#1a2420] rounded-2xl shadow-xl p-6 md:p-8">
        {/* Step 1: Grunddaten */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Firmenname <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.firmenname}
                  onChange={(e) => setFormData({ ...formData, firmenname: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground border-border"
                  placeholder="Musterfirma GmbH"
                />
              </div>
              {errors.firmenname && <p className="text-red-500 text-sm mt-1">{errors.firmenname}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Vorname des Vertreters <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.vorname}
                    onChange={(e) => setFormData({ ...formData, vorname: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground border-border"
                    placeholder="Vorname"
                  />
                </div>
                {errors.vorname && <p className="text-red-500 text-sm mt-1">{errors.vorname}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nachname des Vertreters <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.nachname}
                    onChange={(e) => setFormData({ ...formData, nachname: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground border-border"
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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground border-border"
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
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground border-border"
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
                  value={formData.passwort}
                  onChange={(e) => setFormData({ ...formData, passwort: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground border-border"
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
                      formData.specializations.includes(spec.id)
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
        )}

        {/* Step 2: Verfügbarkeit */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Arbeitszeiten</label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Von</label>
                  <input
                    type="time"
                    value={formData.workingHours.start}
                    onChange={(e) => setFormData({
                      ...formData,
                      workingHours: { ...formData.workingHours, start: e.target.value }
                    })}
                    className="w-full p-3 rounded-xl border-2 border-border focus:border-primary focus:outline-none bg-background dark:bg-[#0f1512] text-foreground"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Bis</label>
                  <input
                    type="time"
                    value={formData.workingHours.end}
                    onChange={(e) => setFormData({
                      ...formData,
                      workingHours: { ...formData.workingHours, end: e.target.value }
                    })}
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
                      formData.workingDays[day]
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
                <input
                  type="text"
                  value={formData.serviceArea}
                  onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-background dark:bg-[#0f1512] text-foreground border-border"
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
                  onClick={() => setFormData({ ...formData, hasVehicle: true })}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    formData.hasVehicle
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 dark:bg-[#0f1512]"
                  }`}
                >
                  <span className={`text-sm font-medium ${formData.hasVehicle ? "text-primary" : "text-foreground"}`}>
                    Ja
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasVehicle: false })}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    !formData.hasVehicle
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 dark:bg-[#0f1512]"
                  }`}
                >
                  <span className={`text-sm font-medium ${!formData.hasVehicle ? "text-primary" : "text-foreground"}`}>
                    Nein
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Verifizierung */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Berufserfahrung</label>
              <textarea
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full pl-4 pr-4 py-3 rounded-xl border-2 border-border focus:border-primary focus:outline-none min-h-[100px] bg-background dark:bg-[#0f1512] text-foreground"
                placeholder="Beschreiben Sie Ihre Berufserfahrung..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Qualifikationen & Zertifikate</label>
              <textarea
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                className="w-full pl-4 pr-4 py-3 rounded-xl border-2 border-border focus:border-primary focus:outline-none min-h-[80px] bg-background dark:bg-[#0f1512] text-foreground"
                placeholder="z.B. Meisterbrief, Gesellenbrief..."
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary mt-0.5"
                />
                <span className="text-sm text-muted-foreground">
                  Ich akzeptiere die AGB und Datenschutzerklärung
                </span>
              </label>
              {errors.agreeTerms && <p className="text-red-500 text-sm">{errors.agreeTerms}</p>}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeDataProcessing}
                  onChange={(e) => setFormData({ ...formData, agreeDataProcessing: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary mt-0.5"
                />
                <span className="text-sm text-muted-foreground">
                  Ich stimme der Verarbeitung meiner Daten zur Vermittlung von Aufträgen zu
                </span>
              </label>
              {errors.agreeDataProcessing && <p className="text-red-500 text-sm">{errors.agreeDataProcessing}</p>}
            </div>

            <div className="mt-6 p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
              <p className="text-sm text-muted-foreground text-center">
                Schreiben Sie uns in WhatsApp "Registrierung abschließen".
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-4 mt-8">
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-primary text-white font-semibold py-4 rounded-full hover:bg-primary/90 transition-all"
            >
              Weiter
            </button>
          ) : (
            <>
              {errors.submit && <p className="text-red-500 text-sm mr-4">{errors.submit}</p>}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-accent text-white font-semibold py-4 rounded-full hover:bg-accent/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>Registrierung läuft...</>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Registrierung abschließen in WhatsApp
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}