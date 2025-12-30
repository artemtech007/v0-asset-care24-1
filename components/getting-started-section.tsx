"use client"

import { useEffect, useRef, useState } from "react"
import { UserPlus, Settings, Rocket } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "Registrierung",
    description: "Einfache Online-Registrierung mit wenigen Klicks",
  },
  {
    icon: Settings,
    title: "Konfiguration",
    description: "Anpassung an Ihre spezifischen Anforderungen",
  },
  {
    icon: Rocket,
    title: "Start",
    description: "Sofortige Nutzung aller gewählten Funktionen",
  },
]

export function GettingStartedSection() {
  const [isVisible, setIsVisible] = useState(false)
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

  return (
    <section ref={sectionRef} className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div
          className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">So starten Sie AssetCare24</h2>
          <div className="w-24 h-1 bg-accent mx-auto rounded-full" />
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-24 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative text-center transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-white font-bold flex items-center justify-center text-sm">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">{step.title}</h3>
                <p className="text-foreground/70">{step.description}</p>
              </div>
            ))}
          </div>

          <div
            className={`max-w-3xl mx-auto text-center p-8 rounded-2xl bg-background border border-primary/10 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            <p className="text-lg text-foreground/80 leading-relaxed">
              Der Einstieg in die moderne Immobilienverwaltung war noch nie so einfach. Unser erfahrenes Team begleitet
              Sie bei jedem Schritt und sorgt für einen reibungslosen Übergang zu AssetCare24. Flexible Tarifmodelle
              ermöglichen einen kostengünstigen Start für alle Zielgruppen.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
