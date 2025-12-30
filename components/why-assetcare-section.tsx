"use client"

import { motion } from "framer-motion"
import { Shield, Zap, Handshake, Check } from "lucide-react"

const benefits = [
  {
    icon: Shield,
    title: "Sicherheit & Vertrauen",
    features: ["DSGVO-konform", "Deutsche Datenschutzstandards", "Sichere Kommunikation"],
  },
  {
    icon: Zap,
    title: "Effizienz & Einfachheit",
    features: ["Schnelle Zuordnung", "Einfache Prozesse", "Zeitersparnis 60%"],
  },
  {
    icon: Handshake,
    title: "Langfristige Beziehungen",
    features: ["Bewährte Handwerker", "Zufriedene Kunden", "Stabile Partnerschaften"],
  },
]

export function WhyAssetcareSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">Warum AssetCare24?</h2>
          <div className="w-20 h-1 bg-accent mx-auto rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="bg-card dark:bg-[#1a2420] rounded-2xl p-8 border border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-6">
                <benefit.icon className="w-8 h-8 text-primary" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-6">{benefit.title}</h3>

              <ul className="space-y-4">
                {benefit.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
