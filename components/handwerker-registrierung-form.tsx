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

type RegistrationType = "einzelhandwerker" | "unternehmen" | null
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
  const [registrationType, setRegistrationType] = useState<RegistrationType>(null)
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  // File handling
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)])
      updateFormData("dokumenteHochgeladen", true)
      if (errors.dokumenteHochgeladen) {
        setErrors((prev) => ({ ...prev, dokumenteHochgeladen: "" }))
      }
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index)
      if (newFiles.length === 0) updateFormData("dokumenteHochgeladen", false)
      return newFiles
    })
  }

  const fileToBase64 = (file: File): Promise<{ name: string; type: string; content: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        // Remove "data:*/*;base64," prefix for clean content
        const content = (reader.result as string).split(",")[1]
        resolve({
          name: file.name,
          type: file.type,
          content: content,
        })
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (registrationType === "einzelhandwerker" && !formData.name.trim()) {
        newErrors.name = "Name ist erforderlich"
      }
      if (registrationType === "unternehmen" && !formData.firmenname.trim()) {
        newErrors.firmenname = "Firmenname ist erforderlich"
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
    } else {
      setRegistrationType(null)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsSubmitting(true)

    try {
      // Convert files to base64
      const filesData = await Promise.all(selectedFiles.map((file) => fileToBase64(file)))

      const payload = {
        ...formData,
        registrationType,
        files: filesData,
      }

      const response = await fetch("https://assetcare24.org/webhook/d509d181-13ab-4c34-b192-4b8994ec9e49", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
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

  // Registration type selection
  if (!registrationType) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-center text-foreground mb-8">Wählen Sie Ihren Registrierungstyp</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Einzelhandwerker */}
          <button
            onClick={() => setRegistrationType("einzelhandwerker")}
            className="group bg-card dark:bg-[#1a2420] rounded-2xl p-8 border-2 border-border hover:border-primary transition-all duration-300 text-left"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Einzelhandwerker</h3>
            <p className="text-muted-foreground mb-6">
              Sie arbeiten selbstständig und möchten direkt Aufträge erhalten.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                Persönliche Daten
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                Spezialisierungen wählen
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                Arbeitsradius festlegen
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                Portfolio-Fotos hochladen
              </li>
            </ul>
            <div className="mt-6 flex items-center text-primary font-medium">
              Jetzt starten
              <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Handwerksunternehmen */}
          <button
            onClick={() => setRegistrationType("unternehmen")}
            className="group bg-card dark:bg-[#1a2420] rounded-2xl p-8 border-2 border-border hover:border-primary transition-all duration-300 text-left"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Handwerksunternehmen</h3>
            <p className="text-muted-foreground mb-6">
              Sie haben ein Team und möchten Aufträge für Ihre Firma erhalten.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                Firmendaten eingeben
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                Mitarbeiter hinzufügen
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                Dienstleistungen definieren
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                Firmenportfolio erstellen
              </li>
            </ul>
            <div className="mt-6 flex items-center text-primary font-medium">
              Jetzt starten
              <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Benefits */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Verifiziert & Sicher</h4>
              <p className="text-sm text-muted-foreground">Alle Daten werden nach DSGVO geschützt</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Reputation aufbauen</h4>
              <p className="text-sm text-muted-foreground">Kundenbewertungen steigern Ihre Sichtbarkeit</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Stabile Aufträge</h4>
              <p className="text-sm text-muted-foreground">Zugang zu langfristigen Kundenbeziehungen</p>
            </div>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Dokumente hochladen</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              >
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">
                  Ziehen Sie Dateien hierher oder klicken Sie zum Hochladen
                </p>
                <p className="text-xs text-muted-foreground">
                  Gewerbeanmeldung, Zertifikate, Portfolio (PDF, JPG, PNG)
                </p>
              </div>

              {/* File List */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-card p-2 rounded border border-border"
                    >
                      <span className="text-sm truncate max-w-[200px] text-foreground">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
