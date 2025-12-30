"use client"

import { useEffect, useRef, useState } from "react"
import { FileText, Users, MessageCircle, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: FileText,
    title: "Anfrage stellen",
    description: "Beschreiben Sie Ihr Problem oder laden Sie Fotos hoch",
    step: 1,
  },
  {
    icon: Users,
    title: "Schnelle Zuordnung",
    description: "Wir finden den passenden Handwerker für Sie",
    step: 2,
  },
  {
    icon: MessageCircle,
    title: "Direkte Kommunikation",
    description: "Alle Beteiligten kommunizieren transparent",
    step: 3,
  },
  {
    icon: CheckCircle,
    title: "Qualitätssicherung",
    description: "Bewertungen und Garantien für beste Ergebnisse",
    step: 4,
  },
]

export function HowItWorksSection() {
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
          className={`text-center mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Wie funktioniert AssetCare24?
          </h2>
          <div className="w-24 h-1 bg-accent mx-auto rounded-full mb-6" />
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Unser bewährtes System verbindet Hausverwalter, Eigentümer, Mieter und Handwerker für optimale
            Zusammenarbeit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`group relative p-6 rounded-2xl bg-card dark:bg-[#1a2420] border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Step number badge */}
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-accent text-white font-bold flex items-center justify-center text-sm shadow-lg">
                {step.step}
              </div>

              {/* Connector line (hidden on mobile and last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/20" />
              )}

              <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <step.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
