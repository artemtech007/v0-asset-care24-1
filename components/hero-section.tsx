"use client"

import type React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ArrowRight, Lightbulb, Snowflake, Wrench, Home, Sparkles, RefreshCw, Users, Star } from "lucide-react"
import { useEffect, useState } from "react"

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

      <AnimatedParticles />

      <FloatingIcon icon={Lightbulb} className="top-20 left-[10%] hidden lg:block" delay={200} />
      <FloatingIcon icon={Snowflake} className="top-32 right-[12%] hidden lg:block" delay={400} />
      <FloatingIcon icon={Wrench} className="bottom-32 left-[15%] hidden lg:block" delay={600} />
      <FloatingIcon icon={Home} className="bottom-24 right-[10%] hidden lg:block" delay={800} />
      <FloatingIcon icon={Sparkles} className="top-1/2 left-[5%] hidden xl:block" delay={1000} />

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
            <div className="relative inline-block group">
              <div className="absolute -inset-1 bg-accent/50 rounded-xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity" />
              <Button
                asChild
                size="lg"
                className="relative bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8 py-6 h-auto rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
              >
                <Link href="/meldung">
                  JETZT ANFRAGE STELLEN
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </Button>
            </div>

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
