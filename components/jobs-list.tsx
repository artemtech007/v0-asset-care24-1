"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"

const jobs = [
  {
    title: "Elektriker (m/w/d)",
    description:
      "Für kleinere Reparaturen und Installationen im Haushalt. Erfahrung im Umgang mit Elektrotechnik erforderlich.",
    location: "Deutschland",
  },
  {
    title: "Maler (m/w/d)",
    description:
      "Tapezieren, Streichen und Renovierungsarbeiten in Privatwohnungen. Saubere und zuverlässige Arbeitsweise.",
    location: "Deutschland",
  },
  {
    title: "Klempner (m/w/d)",
    description: "Installation und Reparatur von Sanitäranlagen. Flexibilität und Kundenorientierung erwünscht.",
    location: "Deutschland",
  },
  {
    title: "Gärtner (m/w/d)",
    description:
      "Gartenpflege, Rasenmähen und saisonale Arbeiten. Erfahrung im Garten- und Landschaftsbau von Vorteil.",
    location: "Deutschland",
  },
  {
    title: "Allround-Handwerker (m/w/d)",
    description: "Vielseitige Tätigkeiten im Haushalt: Möbelmontage, kleine Reparaturen, Wartungsarbeiten.",
    location: "Deutschland",
  },
  {
    title: "Reinigungskraft (m/w/d)",
    description: "Professionelle Reinigung von Wohnungen und Häusern. Gründlichkeit und Zuverlässigkeit sind wichtig.",
    location: "Deutschland",
  },
]

export function JobsList() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Offene Stellen</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Entdecken Sie unsere aktuellen Stellenangebote und finden Sie Ihren Traumjob
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {jobs.map((job, index) => (
            <div
              key={job.title}
              className={`group bg-card border border-border rounded-2xl p-6 transition-all duration-500 hover:shadow-lg hover:border-accent/30 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 rounded-full bg-accent mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-primary group-hover:text-accent transition-colors duration-200 mb-2">
                    {job.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3 leading-relaxed">{job.description}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
