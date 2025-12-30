"use client"

import { useEffect, useRef, useState } from "react"
import { Clock, TrendingUp } from "lucide-react"

const stats = [
  {
    icon: Clock,
    value: "24/7",
    label: "Verfügbarkeit",
    description: "Rund um die Uhr Zugriff",
  },
  {
    icon: TrendingUp,
    value: "60%",
    label: "Effizienzsteigerung",
    description: "Durchschnittliche Zeitersparnis",
  },
]

export function StatsSection() {
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
    <section
      ref={sectionRef}
      className="py-20 md:py-28 bg-[#004728] dark:bg-[#001f12] text-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div
          className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Ihr Tor zur modernen Immobilienwirtschaft</h2>
          <div className="w-24 h-1 bg-accent mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-3xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-700 hover:bg-white/20 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-5xl font-bold mb-2">{stat.value}</div>
              <div className="text-xl font-semibold mb-1">{stat.label}</div>
              <p className="text-white/70">{stat.description}</p>
            </div>
          ))}
        </div>

        <div
          className={`max-w-4xl mx-auto text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "500ms" }}
        >
          <p className="text-lg text-white/90 leading-relaxed">
            Revolutionieren Sie Ihre Immobilienverwaltung mit AssetCare24. Unsere Plattform vernetzt alle Beteiligten
            und schafft ein effizientes System. Reduzieren Sie administrative Aufwände, beschleunigen Sie Prozesse und
            steigern Sie die Zufriedenheit aller Nutzer. Sichern Sie sich jetzt Ihren Vorsprung in der
            Immobilienbranche!
          </p>
        </div>
      </div>
    </section>
  )
}
