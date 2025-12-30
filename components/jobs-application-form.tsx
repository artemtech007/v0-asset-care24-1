"use client"

import type React from "react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export function JobsApplicationForm() {
  const [isVisible, setIsVisible] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  })
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setFormData({ name: "", phone: "", message: "" })
  }

  return (
    <section ref={sectionRef} id="bewerbung" className="py-20 bg-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`max-w-2xl mx-auto transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Jetzt bewerben</h2>
            <p className="text-lg text-muted-foreground">
              Interessiert? Füllen Sie das Formular aus und wir melden uns bei Ihnen. Keine Registrierung erforderlich.
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Vielen Dank für Ihre Bewerbung!</h3>
              <p className="text-muted-foreground mb-6">
                Wir haben Ihre Anfrage erhalten und werden uns in Kürze bei Ihnen melden.
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Weitere Bewerbung senden
              </Button>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Jetzt bewerben</h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Interessiert? Registrieren Sie sich als Handwerker und werden Sie Teil unseres Teams.
                  </p>
                  <Link href="/registrierung?role=handwerker&from=jobs">
                    <Button
                      size="lg"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-10 py-6 text-lg transition-all duration-200 hover:scale-[1.02]"
                    >
                      Registrieren
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
