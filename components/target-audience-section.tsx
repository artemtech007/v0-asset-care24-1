"use client"

import { useEffect, useRef, useState } from "react"
import { Building2, Home, User, Wrench } from "lucide-react"

const audiences = [
  {
    icon: Building2,
    title: "Hausverwalter",
    description: "Verwalten Sie mehrere Objekte effizient und transparent",
  },
  {
    icon: Home,
    title: "Eigentümer",
    description: "Behalten Sie den Überblick über Ihre Immobilie",
  },
  {
    icon: User,
    title: "Mieter",
    description: "Lösen Sie Probleme schnell und einfach",
  },
  {
    icon: Wrench,
    title: "Handwerker",
    description: "Finden Sie stabile Aufträge und bauen Sie Ihre Reputation auf",
  },
]

export function TargetAudienceSection() {
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
    <section ref={sectionRef} className="py-20 md:py-28 bg-primary/5 dark:bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div
          className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Für wen ist unsere Plattform?
          </h2>
          <div className="w-24 h-1 bg-accent mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, index) => (
            <div
              key={index}
              className={`group relative p-8 rounded-2xl bg-card dark:bg-[#1a2420] border border-border overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-5 group-hover:bg-white/20 transition-all duration-300">
                  <audience.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-white transition-colors duration-300">
                  {audience.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                  {audience.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
