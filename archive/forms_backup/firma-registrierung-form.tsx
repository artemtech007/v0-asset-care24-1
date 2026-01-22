"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  User,
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
  Users,
  X,
  Wrench,
  Zap,
  Paintbrush,
  Droplets,
  Hammer,
  Leaf,
  Sparkles,
  Shield,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

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

export function FirmaRegistrierungForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // File handling
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // Form data
  const [formData, setFormData] = useState({
    // Step 1 - Firmendaten
    firmenname: "",
    rechtlicheForm: "",
    ustId: "",
    handelsregister: "",
    email: "",
    telefon: "",
    website: "",
    spezialisierungen: [] as string[],

    // Step 2 - Ansprechpartner
    vorname: "",
    nachname: "",
    position: "",
    kontaktEmail: "",
    kontaktTelefon: "",
    arbeitszeitStart: "08:00",
    arbeitszeitEnde: "18:00",
    wochenendArbeit: false,
    plzGebiete: "",
    arbeitsradius: "25",
    verkehrsmittel: [] as string[],

    // Step 3 - Verifizierung
    mitarbeiterAnzahl: "",
    jahreImGeschaeft: "",
    qualifikationen: "",
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
      if (!formData.firmenname.trim()) {
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
      if (!formData.vorname.trim()) {
        newErrors.vorname = "Vorname ist erforderlich"
      }
      if (!formData.nachname.trim()) {
        newErrors.nachname = "Nachname ist erforderlich"
      }
      if (!formData.plzGebiete.trim()) {
        newErrors.plzGebiete = "Einsatzgebiet ist erforderlich"
      }
      if (formData.verkehrsmittel.length === 0) {
        newErrors.verkehrsmittel = "Wählen Sie mindestens ein Verkehrsmittel"
      }
    }

    if (step === 3) {
      if (!formData.mitarbeiterAnzahl.trim()) {
        newErrors.mitarbeiterAnzahl = "Anzahl der Mitarbeiter ist erforderlich"
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
      router.back()
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
        registrationType: "unternehmen",
        files: filesData,
      }

      const response = await fetch("https://assetcare24.org/webhook/firma-registration", {
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
        router.push("/dashboard/firma")
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
            Willkommen bei AssetCare24! Ihre Firmenregistrierung wurde erfolgreich abgeschlossen. Sie werden in Kürze zu Ihrem
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
            {currentStep === 1 ? "Firmendaten" : currentStep === 2 ? "Ansprechpartner" : "Verifizierung"}
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
            Firmendaten
          </div>
          <div
            className={`flex items-center gap-1 text-xs ${currentStep >= 2 ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-primary text-white" : "bg-muted"}`}
            >
              {currentStep > 2 ? <Check className="w-4 h-4" /> : "2"}
            </div>
            Ansprechpartner
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
        {/* Step 1: Firmendaten */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Firmeninformationen</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Firmenname <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ihre Firma GmbH"
                  value={formData.firmenname}
                  onChange={(e) => updateFormData("firmenname", e.target.value)}
                  className={`pl-12 h-14 bg-background dark:bg-[#0f1512] ${errors.firmenname ? "border-red-500" : ""}`}
                />
              </div>
              {errors.firmenname && <p className="text-red-500 text-sm mt-1">{errors.firmenname}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Rechtsform</label>
                <Input
                  type="text"
                  placeholder="z.B. GmbH, UG"
                  value={formData.rechtlicheForm}
                  onChange={(e) => updateFormData("rechtlicheForm", e.target.value)}
                  className="h-14 bg-background dark:bg-[#0f1512]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">USt-ID</label>
                <Input
                  type="text"
                  placeholder="DE123456789"
                  value={formData.ustId}
                  onChange={(e) => updateFormData("ustId", e.target.value)}
                  className="h-14 bg-background dark:bg-[#0f1512]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Handelsregister</label>
              <Input
                type="text"
                placeholder="HRB 123456"
                value={formData.handelsregister}
                onChange={(e) => updateFormData("handelsregister", e.target.value)}
                className="h-14 bg-background dark:bg-[#0f1512]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                E-Mail-Adresse <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="info@ihrefirma.de"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  className={`pl-12 h-14 bg-background dark:bg-[#0f1512] ${errors.email ? "border-red-500" : ""}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-foreground mb-2">Website</label>
                <Input
                  type="url"
                  placeholder="www.ihrefirma.de"
                  value={formData.website}
                  onChange={(e) => updateFormData("website", e.target.value)}
                  className="h-14 bg-background dark:bg-[#0f1512]"
                />
              </div>
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

        {/* Step 2: Ansprechpartner */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Ansprechpartner & Verfügbarkeit</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Vorname <span className="text-accent">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Max"
                  value={formData.vorname}
                  onChange={(e) => updateFormData("vorname", e.target.value)}
                  className={`h-14 bg-background dark:bg-[#0f1512] ${errors.vorname ? "border-red-500" : ""}`}
                />
                {errors.vorname && <p className="text-red-500 text-sm mt-1">{errors.vorname}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nachname <span className="text-accent">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Mustermann"
                  value={formData.nachname}
                  onChange={(e) => updateFormData("nachname", e.target.value)}
                  className={`h-14 bg-background dark:bg-[#0f1512] ${errors.nachname ? "border-red-500" : ""}`}
                />
                {errors.nachname && <p className="text-red-500 text-sm mt-1">{errors.nachname}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Position</label>
              <Input
                type="text"
                placeholder="z.B. Geschäftsführer"
                value={formData.position}
                onChange={(e) => updateFormData("position", e.target.value)}
                className="h-14 bg-background dark:bg-[#0f1512]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Kontakt E-Mail</label>
                <Input
                  type="email"
                  placeholder="max@ihrefirma.de"
                  value={formData.kontaktEmail}
                  onChange={(e) => updateFormData("kontaktEmail", e.target.value)}
                  className="h-14 bg-background dark:bg-[#0f1512]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Kontakt Telefon</label>
                <Input
                  type="tel"
                  placeholder="+49 123 456789"
                  value={formData.kontaktTelefon}
                  onChange={(e) => updateFormData("kontaktTelefon", e.target.value)}
                  className="h-14 bg-background dark:bg-[#0f1512]"
                />
              </div>
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
              <h2 className="text-xl font-bold text-foreground">Verifizierung & Unternehmensdaten</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Anzahl Mitarbeiter <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="z.B. 5"
                    value={formData.mitarbeiterAnzahl}
                    onChange={(e) => updateFormData("mitarbeiterAnzahl", e.target.value)}
                    className={`pl-12 h-14 bg-background dark:bg-[#0f1512] ${errors.mitarbeiterAnzahl ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.mitarbeiterAnzahl && <p className="text-red-500 text-sm mt-1">{errors.mitarbeiterAnzahl}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Jahre im Geschäft</label>
                <Input
                  type="number"
                  placeholder="z.B. 10"
                  value={formData.jahreImGeschaeft}
                  onChange={(e) => updateFormData("jahreImGeschaeft", e.target.value)}
                  className="h-14 bg-background dark:bg-[#0f1512]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Qualifikationen & Zertifikate</label>
              <textarea
                placeholder="z.B. ISO 9001 Zertifizierung, Meisterbriefe der Mitarbeiter, etc."
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
                  Gewerbeschein, Handelsregisterauszug, Zertifikate (PDF, JPG, PNG)
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
