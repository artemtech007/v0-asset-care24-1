"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Building2,
  Home,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  X,
  ArrowLeft,
  ArrowRight,
  Camera,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

type UserRole = "hausverwalter" | "eigentuemer" | "mieter" | null

interface FormData {
  // Common fields
  name: string
  telefon: string
  email: string
  beschreibung: string
  adresse: string
  fotos: File[]

  // Hausverwalter specific
  objektTyp: string
  bereich: string
  kategorie: string
  dringlichkeit: string
  firma: string

  // Eigentuemer specific
  immobilienTyp: string

  // Registration
  wantsRegistration: boolean
  passwort: string
}

const initialFormData: FormData = {
  name: "",
  telefon: "",
  email: "",
  beschreibung: "",
  adresse: "",
  fotos: [],
  objektTyp: "",
  bereich: "",
  kategorie: "",
  dringlichkeit: "mittel",
  firma: "",
  immobilienTyp: "",
  wantsRegistration: false,
  passwort: "",
}

export function ServiceAnfragenForm() {
  const searchParams = useSearchParams()
  const initialRole = searchParams.get("role") as UserRole

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const roles = [
    {
      id: "hausverwalter" as const,
      icon: Building2,
      title: "Hausverwalter",
      description: "Verwalten Sie mehrere Objekte",
    },
    {
      id: "eigentuemer" as const,
      icon: Home,
      title: "Eigentumer",
      description: "Fur Ihre eigene Immobilie",
    },
    {
      id: "mieter" as const,
      icon: User,
      title: "Mieter",
      description: "Schnelle Hilfe bei Problemen",
    },
  ]

  const getTotalSteps = () => {
    if (selectedRole === "hausverwalter") return 4
    if (selectedRole === "eigentuemer") return 3
    return 2
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData((prev) => ({
      ...prev,
      fotos: [...prev.fotos, ...files].slice(0, 5),
    }))
  }

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index),
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateStep = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (selectedRole === "hausverwalter") {
      if (currentStep === 1) {
        if (!formData.objektTyp) newErrors.objektTyp = "Bitte wahlen Sie einen Objekttyp"
        if (!formData.bereich) newErrors.bereich = "Bitte geben Sie den Bereich an"
      } else if (currentStep === 2) {
        if (!formData.kategorie) newErrors.kategorie = "Bitte wahlen Sie eine Kategorie"
        if (!formData.beschreibung.trim()) newErrors.beschreibung = "Bitte beschreiben Sie das Problem"
      } else if (currentStep === 3) {
        if (!formData.name.trim()) newErrors.name = "Bitte geben Sie Ihren Namen ein"
        if (!formData.telefon.trim()) newErrors.telefon = "Bitte geben Sie Ihre Telefonnummer ein"
      }
    } else if (selectedRole === "eigentuemer") {
      if (currentStep === 1) {
        if (!formData.immobilienTyp) newErrors.immobilienTyp = "Bitte wahlen Sie einen Immobilientyp"
        if (!formData.beschreibung.trim()) newErrors.beschreibung = "Bitte beschreiben Sie das Problem"
      } else if (currentStep === 2) {
        if (!formData.name.trim()) newErrors.name = "Bitte geben Sie Ihren Namen ein"
        if (!formData.telefon.trim()) newErrors.telefon = "Bitte geben Sie Ihre Telefonnummer ein"
      }
    } else if (selectedRole === "mieter") {
      if (currentStep === 1) {
        if (!formData.beschreibung.trim()) newErrors.beschreibung = "Bitte beschreiben Sie das Problem"
        if (!formData.name.trim()) newErrors.name = "Bitte geben Sie Ihren Namen ein"
        if (!formData.telefon.trim()) newErrors.telefon = "Bitte geben Sie Ihre Telefonnummer ein"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep()) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const resetForm = () => {
    setSelectedRole(null)
    setCurrentStep(1)
    setFormData(initialFormData)
    setErrors({})
    setIsSubmitted(false)
  }

  // Success screen
  if (isSubmitted) {
    return (
      <div className="bg-card dark:bg-[#1a2420] rounded-2xl shadow-lg p-8 md:p-12 text-center animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Vielen Dank!</h2>
        <p className="text-muted-foreground text-lg mb-6">
          Ihre Anfrage wurde erfolgreich gesendet. Unser Team wird sich schnellstmoglich bei Ihnen melden.
        </p>
        {!formData.wantsRegistration && (
          <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-6 mb-8">
            <p className="text-foreground font-medium mb-3">Mochten Sie Ihre Anfragen verfolgen?</p>
            <Link href="/registrierung">
              <Button className="bg-primary hover:bg-primary/90 text-white">Jetzt kostenlos registrieren</Button>
            </Link>
          </div>
        )}
        <Button
          onClick={resetForm}
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
        >
          Neue Anfrage erstellen
        </Button>
      </div>
    )
  }

  // Role selection screen
  if (!selectedRole) {
    return (
      <div className="bg-card dark:bg-[#1a2420] rounded-2xl shadow-lg p-8 md:p-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-3">Wie konnen wir Ihnen helfen?</h1>
          <p className="text-muted-foreground">Wahlen Sie Ihre Rolle, um fortzufahren</p>
        </div>

        <div className="grid gap-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className="flex items-center gap-4 p-6 rounded-xl border-2 border-border hover:border-primary bg-background dark:bg-[#0f1512] transition-all duration-200 hover:shadow-md text-left group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <role.icon className="w-7 h-7 text-primary group-hover:text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{role.title}</h3>
                <p className="text-muted-foreground text-sm">{role.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Form screens
  return (
    <div className="bg-card dark:bg-[#1a2420] rounded-2xl shadow-lg p-8 md:p-12">
      {/* Header with back button and progress */}
      <div className="mb-8">
        <button
          onClick={() => (currentStep === 1 ? setSelectedRole(null) : handleBack())}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Zuruck
        </button>

        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-foreground">
            {selectedRole === "hausverwalter" && "Anfrage als Hausverwalter"}
            {selectedRole === "eigentuemer" && "Anfrage als Eigentumer"}
            {selectedRole === "mieter" && "Schnelle Hilfe"}
          </h2>
          <span className="text-sm text-muted-foreground">
            Schritt {currentStep}/{getTotalSteps()}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / getTotalSteps()) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* HAUSVERWALTER FORM */}
        {selectedRole === "hausverwalter" && (
          <>
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-primary">Objekt auswahlen</h3>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Objekttyp <span className="text-accent">*</span>
                  </Label>
                  <select
                    name="objektTyp"
                    value={formData.objektTyp}
                    onChange={handleChange}
                    className={`w-full h-14 px-4 rounded-lg border bg-background dark:bg-[#0f1512] text-foreground ${errors.objektTyp ? "border-red-500" : "border-input"}`}
                  >
                    <option value="">Bitte wahlen...</option>
                    <option value="mehrfamilienhaus">Mehrfamilienhaus</option>
                    <option value="wohnanlage">Wohnanlage</option>
                    <option value="gewerbe">Gewerbeobjekt</option>
                    <option value="mischnutzung">Mischnutzung</option>
                  </select>
                  {errors.objektTyp && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.objektTyp}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Bereich <span className="text-accent">*</span>
                  </Label>
                  <select
                    name="bereich"
                    value={formData.bereich}
                    onChange={handleChange}
                    className={`w-full h-14 px-4 rounded-lg border bg-background dark:bg-[#0f1512] text-foreground ${errors.bereich ? "border-red-500" : "border-input"}`}
                  >
                    <option value="">Bitte wahlen...</option>
                    <option value="treppenhaus">Treppenhaus</option>
                    <option value="keller">Keller</option>
                    <option value="dach">Dach</option>
                    <option value="aussenbereich">Ausenbereich</option>
                    <option value="heizung">Heizungsanlage</option>
                    <option value="aufzug">Aufzug</option>
                    <option value="sonstiges">Sonstiges</option>
                  </select>
                  {errors.bereich && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.bereich}
                    </p>
                  )}
                </div>

                {/* Photo upload */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Fotos hochladen (optional)</Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Klicken oder Dateien hierher ziehen</p>
                    <p className="text-sm text-muted-foreground">Max. 5 Bilder</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {formData.fotos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.fotos.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                            <Camera className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-primary">Problem beschreiben</h3>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Kategorie <span className="text-accent">*</span>
                  </Label>
                  <select
                    name="kategorie"
                    value={formData.kategorie}
                    onChange={handleChange}
                    className={`w-full h-14 px-4 rounded-lg border bg-background dark:bg-[#0f1512] text-foreground ${errors.kategorie ? "border-red-500" : "border-input"}`}
                  >
                    <option value="">Bitte wahlen...</option>
                    <option value="elektrik">Elektrik</option>
                    <option value="sanitaer">Sanitar</option>
                    <option value="heizung">Heizung</option>
                    <option value="malerarbeiten">Malerarbeiten</option>
                    <option value="schlosser">Schlosser</option>
                    <option value="garten">Gartenpflege</option>
                    <option value="reinigung">Reinigung</option>
                    <option value="sonstiges">Sonstiges</option>
                  </select>
                  {errors.kategorie && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.kategorie}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Dringlichkeit</Label>
                  <div className="flex gap-3">
                    {[
                      { value: "niedrig", label: "Niedrig", color: "bg-green-500" },
                      { value: "mittel", label: "Mittel", color: "bg-yellow-500" },
                      { value: "hoch", label: "Hoch", color: "bg-red-500" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, dringlichkeit: option.value }))}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                          formData.dringlichkeit === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${option.color} mx-auto mb-1`} />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Detaillierte Beschreibung <span className="text-accent">*</span>
                  </Label>
                  <Textarea
                    name="beschreibung"
                    value={formData.beschreibung}
                    onChange={handleChange}
                    placeholder="Beschreiben Sie das Problem moglichst genau..."
                    className={`min-h-[150px] ${errors.beschreibung ? "border-red-500" : ""}`}
                  />
                  {errors.beschreibung && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.beschreibung}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-primary">Kontaktdaten</h3>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Firma</Label>
                  <Input
                    name="firma"
                    value={formData.firma}
                    onChange={handleChange}
                    placeholder="Name der Hausverwaltung"
                    className="h-14"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Ihr Name <span className="text-accent">*</span>
                  </Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Vor- und Nachname"
                    className={`h-14 ${errors.name ? "border-red-500" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Telefon <span className="text-accent">*</span>
                    </Label>
                    <Input
                      name="telefon"
                      type="tel"
                      value={formData.telefon}
                      onChange={handleChange}
                      placeholder="+49 30 123 456"
                      className={`h-14 ${errors.telefon ? "border-red-500" : ""}`}
                    />
                    {errors.telefon && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.telefon}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">E-Mail</Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ihre@email.de"
                      className="h-14"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Adresse des Objekts</Label>
                  <Input
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    placeholder="Strase, Hausnummer, PLZ, Ort"
                    className="h-14"
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-primary">Registrierung (optional)</h3>

                <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-6">
                  <h4 className="font-semibold text-foreground mb-3">Vorteile der Registrierung:</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Alle Anfragen im Uberblick
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Direkte Kommunikation mit Handwerkern
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Statusupdates in Echtzeit
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Dokumentation aller Vorgange
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, wantsRegistration: true }))}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      formData.wantsRegistration
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <CheckCircle
                      className={`w-6 h-6 mx-auto mb-2 ${formData.wantsRegistration ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span className="font-medium">Ja, registrieren</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, wantsRegistration: false }))}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      !formData.wantsRegistration
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <X
                      className={`w-6 h-6 mx-auto mb-2 ${!formData.wantsRegistration ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span className="font-medium">Uberspringen</span>
                  </button>
                </div>

                {formData.wantsRegistration && (
                  <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Passwort erstellen</Label>
                      <Input
                        name="passwort"
                        type="password"
                        value={formData.passwort}
                        onChange={handleChange}
                        placeholder="Mindestens 6 Zeichen"
                        className="h-14"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* EIGENTUEMER FORM */}
        {selectedRole === "eigentuemer" && (
          <>
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-primary">Ihr Problem beschreiben</h3>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Immobilientyp <span className="text-accent">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "haus", label: "Haus", icon: Home },
                      { value: "wohnung", label: "Wohnung", icon: Building2 },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, immobilienTyp: option.value }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.immobilienTyp === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <option.icon
                          className={`w-8 h-8 mx-auto mb-2 ${formData.immobilienTyp === option.value ? "text-primary" : "text-muted-foreground"}`}
                        />
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.immobilienTyp && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.immobilienTyp}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Beschreibung des Problems <span className="text-accent">*</span>
                  </Label>
                  <Textarea
                    name="beschreibung"
                    value={formData.beschreibung}
                    onChange={handleChange}
                    placeholder="Was ist das Problem? Beschreiben Sie es moglichst genau..."
                    className={`min-h-[120px] ${errors.beschreibung ? "border-red-500" : ""}`}
                  />
                  {errors.beschreibung && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.beschreibung}
                    </p>
                  )}
                </div>

                {/* Photo upload */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Fotos hochladen (optional)</Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Foto hinzufugen</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {formData.fotos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.fotos.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                            <Camera className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-primary">Ihre Kontaktdaten</h3>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Ihr Name <span className="text-accent">*</span>
                  </Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Vor- und Nachname"
                    className={`h-14 ${errors.name ? "border-red-500" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Telefon <span className="text-accent">*</span>
                  </Label>
                  <Input
                    name="telefon"
                    type="tel"
                    value={formData.telefon}
                    onChange={handleChange}
                    placeholder="+49 30 123 456"
                    className={`h-14 ${errors.telefon ? "border-red-500" : ""}`}
                  />
                  {errors.telefon && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.telefon}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">E-Mail</Label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ihre@email.de"
                    className="h-14"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Adresse</Label>
                  <Input
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    placeholder="Strase, Hausnummer, PLZ, Ort"
                    className="h-14"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-primary">Registrierung (optional)</h3>

                <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-6">
                  <h4 className="font-semibold text-foreground mb-3">Vorteile fur Eigentumer:</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Alle Reparaturen dokumentiert
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Direkte Kommunikation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Kostenubersicht
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, wantsRegistration: true }))}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      formData.wantsRegistration
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="font-medium">Ja, registrieren</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, wantsRegistration: false }))}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      !formData.wantsRegistration
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="font-medium">Uberspringen</span>
                  </button>
                </div>

                {formData.wantsRegistration && (
                  <div className="space-y-2 animate-in fade-in-0 duration-200">
                    <Label className="text-foreground font-medium">Passwort erstellen</Label>
                    <Input
                      name="passwort"
                      type="password"
                      value={formData.passwort}
                      onChange={handleChange}
                      placeholder="Mindestens 6 Zeichen"
                      className="h-14"
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* MIETER FORM - Simplest */}
        {selectedRole === "mieter" && (
          <>
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-primary">Schnell Hilfe bekommen</h3>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Was ist das Problem? <span className="text-accent">*</span>
                  </Label>
                  <Textarea
                    name="beschreibung"
                    value={formData.beschreibung}
                    onChange={handleChange}
                    placeholder="Beschreiben Sie kurz, was passiert ist..."
                    className={`min-h-[120px] ${errors.beschreibung ? "border-red-500" : ""}`}
                  />
                  {errors.beschreibung && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.beschreibung}
                    </p>
                  )}
                </div>

                {/* Photo upload */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Foto hochladen (optional)</Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <Camera className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                    <p className="text-sm text-muted-foreground">Foto hinzufugen</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {formData.fotos.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {formData.fotos.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <Camera className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Ihr Name <span className="text-accent">*</span>
                    </Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Vor- und Nachname"
                      className={`h-14 ${errors.name ? "border-red-500" : ""}`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Telefon <span className="text-accent">*</span>
                    </Label>
                    <Input
                      name="telefon"
                      type="tel"
                      value={formData.telefon}
                      onChange={handleChange}
                      placeholder="+49 170 123456"
                      className={`h-14 ${errors.telefon ? "border-red-500" : ""}`}
                    />
                    {errors.telefon && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.telefon}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Fast fertig!</h3>
                  <p className="text-muted-foreground">Mochten Sie sich registrieren, um Ihre Anfrage zu verfolgen?</p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, wantsRegistration: true }))}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      formData.wantsRegistration
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="font-medium">Ja, registrieren</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, wantsRegistration: false }))}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      !formData.wantsRegistration
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="font-medium">Nein, danke</span>
                  </button>
                </div>

                {formData.wantsRegistration && (
                  <div className="space-y-4 animate-in fade-in-0 duration-200">
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">E-Mail</Label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="ihre@email.de"
                        className="h-14"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Passwort erstellen</Label>
                      <Input
                        name="passwort"
                        type="password"
                        value={formData.passwort}
                        onChange={handleChange}
                        placeholder="Mindestens 6 Zeichen"
                        className="h-14"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-4 pt-4">
          {currentStep < getTotalSteps() ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-white"
            >
              Weiter
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-14 text-lg font-semibold bg-accent hover:bg-accent/90 text-white"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Wird gesendet...
                </span>
              ) : selectedRole === "mieter" ? (
                "Jetzt Hilfe holen"
              ) : (
                "Anfrage absenden"
              )}
            </Button>
          )}
        </div>

        {/* Security notice */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
          <Shield className="w-4 h-4 text-primary flex-shrink-0" />
          <span>Ihre Daten sind bei uns sicher und werden vertraulich behandelt.</span>
        </div>
      </form>
    </div>
  )
}
