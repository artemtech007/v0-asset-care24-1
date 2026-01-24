"use client"

import { motion } from "framer-motion"
import { Check, Briefcase, Star, BarChart3, Handshake } from "lucide-react"

const clientBenefits = [
  { text: "Schnelle Problemlösung" },
  { text: "Transparente Preise" },
  { text: "Qualifizierte Handwerker" },
  { text: "Einfache Nachverfolgung" },
]

const handwerkerBenefits = [
  { icon: Briefcase, text: "Regelmäßige Aufträge" },
  { icon: Star, text: "Reputationsaufbau" },
  { icon: BarChart3, text: "Verdienst-Übersicht" },
  { icon: Handshake, text: "Direkter Kundenkontakt" },
]

export function BenefitsSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">Was bieten wir Ihnen?</h2>
          <div className="w-20 h-1 bg-accent mx-auto" />
        </motion.div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Für Auftraggeber */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card dark:bg-[#1a2420] rounded-2xl p-8 border border-border shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Für Auftraggeber</h3>
            </div>
            <ul className="space-y-4">
              {clientBenefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg text-foreground">{benefit.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Für Handwerker */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card dark:bg-[#1a2420] rounded-2xl p-8 border border-border shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Für Handwerker</h3>
            </div>
            <ul className="space-y-4">
              {handwerkerBenefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg text-foreground">{benefit.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
