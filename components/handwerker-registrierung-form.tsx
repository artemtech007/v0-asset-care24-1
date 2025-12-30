"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Car,
  Bike,
  Train,
  FileText,
  Upload,
  Check,
  ChevronRight,
  ChevronLeft,
  Wrench,
  Zap,
  Paintbrush,
  Droplets,
  Hammer,
  Leaf,
  Sparkles,
  Shield,
  Award,
  Users,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

type RegistrationType = "einzelhandwerker" | null
type Step = 1 | 2 | 3

const specializations = [
  { id: "elektriker", label: "Elektriker", icon: Zap },
  { id: "maler", label: "Maler", icon: Paintbrush },
  { id: "klempner", label: "Klempner", icon: Droplets },
  { id: "schreiner", label: "Schreiner", icon: Hammer },
  { id: "gartner", label: "Gärtner", icon: Leaf },
  { id: "reinigung", label: "Reinigung", icon: Sparkles },
  { id: "allround", label: "Allround", icon: Wrench },
]

const transportOptions = [
  { id: "auto", label: "Auto", icon: Car },
  { id: "fahrrad", label: "Fahrrad", icon: Bike },
  { id: "offentlich", label: "Öffentlich", icon: Train },
]

export function HandwerkerRegistrierungForm() {
  const router = useRouter()
  const [registrationType, setRegistrationType] = useState<RegistrationType>("einzelhandwerker")
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  // File handling (Removed for MVP)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // Form data
  const [formData, setFormData] = useState({
    // Step 1 - Grunddaten
    name: "",
    firmenname: "",
    email: "",
    telefon: "",
    spezialisierungen: [] as string[],
    // Company specific
    mitarbeiterAnzahl: "",
    // Step 2 - Verfügbarkeit
    arbeitszeitStart: "08:00",
    arbeitszeitEnde: "18:00",
    wochenendArbeit: false,
    plzGebiete: "",
    arbeitsradius: "25",
    verkehrsmittel: [] as string[],
    // Step 3 - Verifizierung
    qualifikationen: "",
    erfahrungJahre: "",
    dokumenteHochgeladen: false,
    agbAkzeptiert: false,
    datenschutzAkzeptiert: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateFormData = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const toggleArrayField = (field: "spezialisierungen" | "verkehrsmittel", value: string) => {
    const current = formData[field]
    if (current.includes(value)) {
      updateFormData(
        field,
        current.filter((v) => v !== value),
      )
    } else {
      updateFormData(field, [...current, value])
    }
  }

  // File handling removed for MVP - keeping stubs to avoid breaking
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {}
  const removeFile = (index: number) => {}

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (registrationType === "einzelhandwerker" && !formData.name.trim()) {
        newErrors.name = "Name ist erforderlich"
      }
      if (!formData.email.trim()) {
        newErrors.email = "E-Mail ist erforderlich"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Ungültige E-Mail-Adresse"
      }
      if (!formData.telefon.trim()) {
        newErrors.telefon = "Telefonnummer ist erforderlich"
      }
      if (formData.spezialisierungen.length === 0) {
        newErrors.spezialisierungen = "Wählen Sie mindestens eine Spezialisierung"
      }
    }

    if (step === 2) {
      if (!formData.plzGebiete.trim()) {
        newErrors.plzGebiete = "Einsatzgebiet ist erforderlich"
      }
      if (formData.verkehrsmittel.length === 0) {
        newErrors.verkehrsmittel = "Wählen Sie mindestens ein Verkehrsmittel"
      }
    }

    if (step === 3) {
      if (!formData.erfahrungJahre.trim()) {
        newErrors.erfahrungJahre = "Erfahrung ist erforderlich"
      }
      if (!formData.agbAkzeptiert) {
        newErrors.agbAkzeptiert = "Sie müssen die AGB akzeptieren"
      }
      if (!formData.datenschutzAkzeptiert) {
        newErrors.datenschutzAkzeptiert = "Sie müssen die Datenschutzerklärung akzeptieren"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => (prev + 1) as Step)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsSubmitting(true)

    // Construct simple payload without files
    const payload = {
      ...formData,
      registrationType,
      // files: [] // No files for now
    }

    try {
      const response = await fetch("https://assetcare24.org/webhook/d509d181-13ab-4c34-b192-4b8994ec9e49", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`)
      }

      setIsSubmitting(false)
      setIsSuccess(true)

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard/handwerker")
      }, 2000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setIsSubmitting(false)
      setErrors((prev) => ({ ...prev, submit: "Fehler beim Senden. Bitte versuchen Sie es erneut." }))
    }
  }

  // Success screen
  if (isSuccess) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-card dark:bg-[#1a2420] rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Registrierung erfolgreich!</h2>
          <p className="text-muted-foreground mb-6">
            Willkommen bei AssetCare24! Ihre Registrierung wurde erfolgreich abgeschlossen. Sie werden in Kürze zu Ihrem
            Dashboard weitergeleitet.
          </p>
          <div className="flex items-center justify-center gap-2 text-primary">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    )
  }


  // Multi-step form
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Schritt {currentStep}/3:{" "}
            {currentStep === 1 ? "Grunddaten" : currentStep === 2 ? "Verfügbarkeit" : "Verifizierung"}
          </span>
          <span className="text-sm text-muted-foreground">{Math.round((currentStep / 3) * 100)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <div
            className={`flex items-center gap-1 text-xs ${currentStep >= 1 ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-primary text-white" : "bg-muted"}`}
            >
              {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
            </div>
            Grunddaten
          </div>
          <div
            className={`flex items-center gap-1 text-xs ${currentStep >= 2 ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-primary text-white" : "bg-muted"}`}
            >
              {currentStep > 2 ? <Check className="w-4 h-4" /> : "2"}
            </div>
            Verfügbarkeit
          </div>
          <div
            className={`flex items-center gap-1 text-xs ${currentStep >= 3 ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-primary text-white" : "bg-muted"}`}
            >
              3
            </div>
            Verifizierung
          </div>
        </div>
      </div>

      <div className="bg-card dark:bg-[#1a2420] rounded-2xl shadow-xl p-6 md:p-8">
        {/* Step 1: Grunddaten */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              {registrationType === "einzelhandwerker" ? (
                <User className="w-6 h-6 text-primary" />
              ) : (
                <Building2 className="w-6 h-6 text-primary" />
              )}
              <h2 className="text-xl font-bold text-foreground">
                {registrationType === "einzelhandwerker" ? "Persönliche Daten" : "Firmendaten"}
              </h2>
            </div>

            {registrationType === "einzelhandwerker" ? (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Vollständiger Name <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Max Mustermann"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    className={`pl-12 h-14 bg-background dark:bg-[#0f1512] ${errors.name ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Firmenname <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Musterfirma GmbH"
                      value={formData.firmenname}
                      onChange={(e) => updateFormData("firmenname", e.target.value)}
                      className={`pl-12 h-14 bg-background dark:bg-[#0f1512] ${errors.firmenname ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.firmenname && <p className="text-red-500 text-sm mt-1">{errors.firmenname}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Anzahl Mitarbeiter</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="z.B. 5"
                      value={formData.mitarbeiterAnzahl}
                      onChange={(e) => updateFormData("mitarbeiterAnzahl", e.target.value)}
                      className="pl-12 h-14 bg-background dark:bg-[#0f1512]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                E-Mail-Adresse <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="ihre@email.de"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  className={`pl-12 h-14 bg-background dark:bg-[#0f1512] ${errors.email ? "border-red-500" : ""}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Telefonnummer <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="+49 123 456789"
                  value={formData.telefon}
                  onChange={(e) => updateFormData("telefon", e.target.value)}
                  className={`pl-12 h-14 bg-background dark:bg-[#0f1512] ${errors.telefon ? "border-red-500" : ""}`}
                />
              </div>
              {errors.telefon && <p className="text-red-500 text-sm mt-1">{errors.telefon}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Spezialisierungen <span className="text-accent">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {specializations.map((spec) => {
                  const Icon = spec.icon
                  const isSelected = formData.spezialisierungen.includes(spec.id)
                  return (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => toggleArrayField("spezialisierungen", spec.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background dark:bg-[#0f1512] text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{spec.label}</span>
                    </button>
                  )
                })}
              </div>
              {errors.spezialisierungen && <p className="text-red-500 text-sm mt-2">{errors.spezialisierungen}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Verfügbarkeit */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              {registrationType === "einzelhandwerker" ? (
                <User className="w-6 h-6 text-primary" />
              ) : (
                <Building2 className="w-6 h-6 text-primary" />
              )}
              <h2 className="text-xl font-bold text-foreground">
                {registrationType === "einzelhandwerker" ? "Persönliche Daten" : "Firmendaten"}
              </h2>
            </div>

            {registrationType === "einzelhandwerker" ? (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Vollständiger Name <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Max Mustermann"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    className={`pl-12 h-14 bg-background dark:bg-[#0f1512] ${errors.name ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Firmenname <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Musterfirma GmbH"
                      value={formData.firmenname}
                      onChange={(e) => updateFormData("firmenname", e.target.value)}
                      className={`pl-12 h-14 bg-background dark:bg-[#0f1512] ${errors.firmenname ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.firmenname && <p className="text-red-500 text-sm mt-1">{errors.firmenname}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Anzahl Mitarbeiter</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="z.B. 5"
                      value={formData.mitarbeiterAnzahl}
                      onChange={(e) => updateFormData("mitarbeiterAnzahl", e.target.value)}
                      className="pl-12 h-14 bg-background dark:bg-[#0f1512]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                E-Mail-Adresse <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="ihre@email.de"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  className={`pl-12 h-14 bg-background dark:bg-[#0f1512] ${errors.email ? "border-red-500" : ""}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Telefonnummer <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="+49 123 456789"
                  value={formData.telefon}
                  onChange={(e) => updateFormData("telefon", e.target.value)}
                  className={`pl-12 h-14 bg-background dark:bg-[#0f1512] ${errors.telefon ? "border-red-500" : ""}`}
                />
              </div>
              {errors.telefon && <p className="text-red-500 text-sm mt-1">{errors.telefon}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Spezialisierungen <span className="text-accent">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {specializations.map((spec) => {
                  const Icon = spec.icon
                  const isSelected = formData.spezialisierungen.includes(spec.id)
                  return (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => toggleArrayField("spezialisierungen", spec.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background dark:bg-[#0f1512] text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{spec.label}</span>
                    </button>
                  )
                })}
              </div>
              {errors.spezialisierungen && <p className="text-red-500 text-sm mt-2">{errors.spezialisierungen}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Verfügbarkeit */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Verfügbarkeit & Einsatzgebiet</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Arbeitszeiten</label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Von</label>
                  <Input
                    type="time"
                    value={formData.arbeitszeitStart}
                    onChange={(e) => updateFormData("arbeitszeitStart", e.target.value)}
                    className="h-12 bg-background dark:bg-[#0f1512]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Bis</label>
                  <Input
                    type="time"
                    value={formData.arbeitszeitEnde}
                    onChange={(e) => updateFormData("arbeitszeitEnde", e.target.value)}
                    className="h-12 bg-background dark:bg-[#0f1512]"
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 mt-3 cursor-pointer">
                <Checkbox
                  checked={formData.wochenendArbeit}
                  onCheckedChange={(checked) => updateFormData("wochenendArbeit", checked as boolean)}
                />
                <span className="text-sm text-muted-foreground">Auch am Wochenende verfügbar</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Einsatzgebiet (PLZ) <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="z.B. 10115, 10117, 10119"
                  value={formData.plzGebiete}
                  onChange={(e) => updateFormData("plzGebiete", e.target.value)}
                  className={`pl-12 h-14 bg-background dark:bg-[#0f1512] ${errors.plzGebiete ? "border-red-500" : ""}`}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Mehrere PLZ durch Komma trennen</p>
              {errors.plzGebiete && <p className="text-red-500 text-sm mt-1">{errors.plzGebiete}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Arbeitsradius (km)</label>
              <Input
                type="number"
                placeholder="25"
                value={formData.arbeitsradius}
                onChange={(e) => updateFormData("arbeitsradius", e.target.value)}
                className="h-14 bg-background dark:bg-[#0f1512]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Verkehrsmittel <span className="text-accent">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {transportOptions.map((opt) => {
                  const Icon = opt.icon
                  const isSelected = formData.verkehrsmittel.includes(opt.id)
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleArrayField("verkehrsmittel", opt.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background dark:bg-[#0f1512] text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  )
                })}
              </div>
              {errors.verkehrsmittel && <p className="text-red-500 text-sm mt-2">{errors.verkehrsmittel}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Verifizierung */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Verifizierung & Qualifikationen</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Berufserfahrung (Jahre) <span className="text-accent">*</span>
              </label>
              <Input
                type="number"
                placeholder="z.B. 10"
                value={formData.erfahrungJahre}
                onChange={(e) => updateFormData("erfahrungJahre", e.target.value)}
                className={`h-14 bg-background dark:bg-[#0f1512] ${errors.erfahrungJahre ? "border-red-500" : ""}`}
              />
              {errors.erfahrungJahre && <p className="text-red-500 text-sm mt-1">{errors.erfahrungJahre}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Qualifikationen & Zertifikate</label>
              <textarea
                placeholder="z.B. Meisterbrief, Elektro-Fachkraft, etc."
                value={formData.qualifikationen}
                onChange={(e) => updateFormData("qualifikationen", e.target.value)}
                className="w-full h-24 px-4 py-3 rounded-lg border border-border bg-background dark:bg-[#0f1512] text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2 italic">
                Hinweis: Dokumente können später einfach per WhatsApp nachgereicht werden.
              </p>
            </div>

            {/* Dokumente Upload entfernt */}

            <div className="space-y-3 pt-4 border-t border-border">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.agbAkzeptiert}
                  onCheckedChange={(checked) => updateFormData("agbAkzeptiert", checked as boolean)}
                  className="mt-0.5"
                />
                <span className="text-sm text-muted-foreground">
                  Ich akzeptiere die{" "}
                  <a href="/agb" className="text-primary hover:underline">
                    Allgemeinen Geschäftsbedingungen
                  </a>{" "}
                  <span className="text-accent">*</span>
                </span>
              </label>
              {errors.agbAkzeptiert && <p className="text-red-500 text-sm">{errors.agbAkzeptiert}</p>}

              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.datenschutzAkzeptiert}
                  onCheckedChange={(checked) => updateFormData("datenschutzAkzeptiert", checked as boolean)}
                  className="mt-0.5"
                />
                <span className="text-sm text-muted-foreground">
                  Ich habe die{" "}
                  <a href="/datenschutz" className="text-primary hover:underline">
                    Datenschutzerklärung
                  </a>{" "}
                  gelesen und akzeptiert <span className="text-accent">*</span>
                </span>
              </label>
              {errors.datenschutzAkzeptiert && <p className="text-red-500 text-sm">{errors.datenschutzAkzeptiert}</p>}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <Button type="button" variant="outline" onClick={handleBack} className="flex items-center gap-2 bg-transparent">
            <ChevronLeft className="w-4 h-4" />
            Zurück
          </Button>

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
            >
              Weiter
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <>
              {errors.submit && <p className="text-red-500 text-sm mr-4">{errors.submit}</p>}
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-accent hover:bg-accent/90 text-white flex items-center gap-2 min-w-[160px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    Registrieren
                    <Check className="w-4 h-4" />
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
