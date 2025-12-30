"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function MeldungForm() {
  const [formData, setFormData] = useState({
    name: "",
    telefon: "",
    beschreibung: "",
    adresse: "",
  })
  const [errors, setErrors] = useState<{ name?: string; telefon?: string }>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: { name?: string; telefon?: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = "Bitte geben Sie Ihren Namen ein"
    }

    if (!formData.telefon.trim()) {
      newErrors.telefon = "Bitte geben Sie Ihre Telefonnummer ein"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12 text-center animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Vielen Dank!</h2>
        <p className="text-muted-foreground text-lg mb-8">
          Ihre Meldung wurde erfolgreich gesendet. Unser Team wird sich schnellstmöglich bei Ihnen melden.
        </p>
        <Button
          onClick={() => {
            setIsSubmitted(false)
            setFormData({ name: "", telefon: "", beschreibung: "", adresse: "" })
          }}
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Neue Meldung erstellen
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-3">Schnelle Meldung einer Störung</h1>
        <p className="text-muted-foreground">
          Füllen Sie das folgende Formular aus, und unser Team kümmert sich um Ihr Anliegen.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground font-medium text-base">
            Name <span className="text-accent">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Ihr Name"
            value={formData.name}
            onChange={handleChange}
            className={`h-14 text-base ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm flex items-center gap-1" role="alert">
              <AlertCircle className="w-4 h-4" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="telefon" className="text-foreground font-medium text-base">
            Telefonnummer <span className="text-accent">*</span>
          </Label>
          <Input
            id="telefon"
            name="telefon"
            type="tel"
            placeholder="0170 1234567"
            value={formData.telefon}
            onChange={handleChange}
            className={`h-14 text-base ${errors.telefon ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          />
          {errors.telefon && (
            <p className="text-red-500 text-sm flex items-center gap-1" role="alert">
              <AlertCircle className="w-4 h-4" />
              {errors.telefon}
            </p>
          )}
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="beschreibung" className="text-foreground font-medium text-base">
            Beschreibung des Problems
          </Label>
          <Textarea
            id="beschreibung"
            name="beschreibung"
            placeholder="Beschreiben Sie kurz, was passiert ist..."
            value={formData.beschreibung}
            onChange={handleChange}
            className="min-h-[120px] text-base resize-none"
          />
        </div>

        {/* Address Field */}
        <div className="space-y-2">
          <Label htmlFor="adresse" className="text-foreground font-medium text-base">
            Adresse <span className="text-muted-foreground text-sm">(optional)</span>
          </Label>
          <Input
            id="adresse"
            name="adresse"
            type="text"
            placeholder="Straße, Hausnummer, PLZ, Ort"
            value={formData.adresse}
            onChange={handleChange}
            className="h-14 text-base"
          />
        </div>

        {/* Required Fields Notice */}
        <p className="text-sm text-muted-foreground">
          <span className="text-accent">*</span> Pflichtfelder
        </p>

        {/* Submit Button - Using Loader2 icon for consistent spinner */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 text-lg font-semibold bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-200 hover:scale-[1.02] disabled:opacity-70"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Wird gesendet...
            </span>
          ) : (
            "Absenden"
          )}
        </Button>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
          <Shield className="w-4 h-4 text-primary flex-shrink-0" />
          <span>Ihre Daten sind bei uns sicher und werden vertraulich behandelt.</span>
        </div>
      </form>
    </div>
  )
}
