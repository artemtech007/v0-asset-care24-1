"use client"

import type React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ArrowRight, Lightbulb, Snowflake, Wrench, Home, Sparkles, RefreshCw, Users, Star } from "lucide-react"
import { useEffect, useState } from "react"
import { generateMainHeroLink } from "@/lib/source-codes"

function FloatingIcon({
  icon: Icon,
  className,
  delay,
}: {
  icon: React.ElementType
  className: string
  delay: number
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`absolute transition-all duration-1000 will-change-transform ${className} ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transform: "translateZ(0)" }}
    >
      <div className="relative" style={{ transform: "translateZ(0)" }}>
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl opacity-50" />
        <div className="relative bg-background/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-4 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
          <Icon className="h-8 w-8 text-primary" />
        </div>
      </div>
    </div>
  )
}

function AnimatedParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ transform: "translateZ(0)" }}>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
          style={{
            left: `${10 + ((i * 7) % 80)}%`,
            top: `${10 + ((i * 11) % 80)}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${6 + (i % 3)}s`,
            transform: "translateZ(0)",
          }}
        />
      ))}
    </div>
  )
}

export function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section
      className="relative bg-background py-20 sm:py-28 lg:py-36 overflow-hidden"
      style={{ isolation: "isolate" }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"
        style={{ transform: "translateZ(0)" }}
      />


      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance transition-all duration-1000 will-change-transform ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transform: isLoaded ? "translateY(0) translateZ(0)" : "translateY(2rem) translateZ(0)" }}
          >
            <span className="inline-block">Ihr zuverlässiger</span>{" "}
            <span className="inline-block relative">
              <span className="relative z-10 text-primary">Haushalts-Service</span>
              <span
                className={`absolute -bottom-2 left-0 h-3 bg-accent/30 rounded-full transition-all duration-1000 delay-500 ${
                  isLoaded ? "w-full" : "w-0"
                }`}
              />
            </span>
          </h1>

          <p
            className={`mt-8 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-pretty transition-all duration-1000 delay-300 will-change-transform ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transform: isLoaded ? "translateY(0) translateZ(0)" : "translateY(2rem) translateZ(0)" }}
          >
            Verwalten Sie Ihr Zuhause einfach: Von der Lampenreparatur bis zur kompletten Hausbetreuung. Alles
            übersichtlich, transparent und bequem.
          </p>

          <div
            className={`mt-10 flex flex-col sm:flex-row justify-center gap-4 transition-all duration-1000 delay-500 will-change-transform ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transform: isLoaded ? "translateY(0) translateZ(0)" : "translateY(2rem) translateZ(0)" }}
          >
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8 py-6 h-auto rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <a
                  href={generateMainHeroLink("14155238886")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  JETZT ANFRAGE STELLEN
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="group-hover:translate-x-2 transition-transform duration-300">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </Button>

            <div className="relative inline-block group">
              <Button
                asChild
                size="lg"
                variant="outline"
                className="relative bg-primary hover:bg-primary/90 text-white border-primary font-semibold text-lg px-8 py-6 h-auto rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Link href="/registrierung?role=handwerker">ALS HANDWERKER BEITRETEN</Link>
              </Button>
            </div>
          </div>

          <div
            className={`mt-12 flex flex-wrap justify-center gap-6 sm:gap-8 text-sm sm:text-base transition-all duration-1000 delay-700 will-change-transform ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transform: isLoaded ? "translateY(0) translateZ(0)" : "translateY(2rem) translateZ(0)" }}
          >
            {[
              { icon: RefreshCw, text: "Alles in einem System" },
              { icon: Users, text: "Transparente Kommunikation" },
              { icon: Star, text: "Langfristige Partnerschaften" },
            ].map((item, index) => (
              <div
                key={item.text}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                style={{ transitionDelay: `${800 + index * 100}ms` }}
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <item.icon className="w-4 h-4" />
                </span>
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </section>
  )
}
