"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, Lock, FileCheck } from "lucide-react"

const securityFeatures = [
  {
    icon: Shield,
    title: "Zentrale Sicherheit",
    description: "Nach deutschen und europäischen Standards",
  },
  {
    icon: Lock,
    title: "Datenverschlüsselung",
    description: "Schutz aller sensiblen Informationen",
  },
  {
    icon: FileCheck,
    title: "DSGVO-Konformität",
    description: "Vollständige Einhaltung der Datenschutzgesetze",
  },
]

export function SecuritySection() {
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">Sicherheit und Datenschutz</h2>
          <div className="w-24 h-1 bg-accent mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            className={`grid grid-cols-1 gap-6 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            {securityFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-5 p-6 rounded-xl bg-card dark:bg-[#1a2420] border border-border shadow-sm hover:shadow-md transition-shadow duration-300"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary mb-1">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            className={`p-8 rounded-2xl bg-card dark:bg-[#1a2420] border border-border transition-all duration-700 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">Ihre Daten sind sicher</h3>
                <p className="text-foreground/60">Made in Germany</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Bei AssetCare24 steht die Sicherheit Ihrer Daten an erster Stelle. Unsere Plattform wurde von Grund auf
              nach strengsten Sicherheitsrichtlinien entwickelt. Alle Datenübertragungen sind Ende-zu-Ende
              verschlüsselt, und ein ausgeklügeltes Zugriffskonzept stellt sicher, dass nur berechtigte Personen Zugang
              zu sensiblen Informationen erhalten.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
