"use client"

import { useEffect, useRef, useState } from "react"
import { Briefcase, Clock, Star } from "lucide-react"

const benefits = [
  {
    icon: Briefcase,
    title: "Sicherer Verdienst",
    description: "Regelmäßige Aufträge und faire Bezahlung",
  },
  {
    icon: Clock,
    title: "Flexible Zeiten",
    description: "Arbeiten Sie, wann es Ihnen passt",
  },
  {
    icon: Star,
    title: "Langfristige Zusammenarbeit",
    description: "Wachsen Sie gemeinsam mit uns",
  },
]

export function JobsBenefits() {
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
    <section ref={sectionRef} className="py-16 bg-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`flex flex-col items-center text-center p-6 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <benefit.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
