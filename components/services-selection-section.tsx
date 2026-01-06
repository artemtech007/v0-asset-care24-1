"use client"

import {
  Building2,
  Home,
  User,
  ArrowRight,
  Users,
  FileText,
  MessageSquare,
  Wrench,
  Calendar,
  AlertTriangle,
  PiggyBank,
  Sparkles,
  Headphones,
  Phone,
} from "lucide-react"
import Link from "next/link"

const roles = [
  {
    id: "hausverwalter",
    icon: Building2,
    title: "Hausverwalter",
    subtitle: "Für Verwaltung mehrerer Objekte",
    features: [
      { icon: Users, text: "Verwaltung gemeinsamer Bereiche" },
      { icon: Wrench, text: "Koordination mehrerer Spezialisten" },
      { icon: FileText, text: "Berichterstattung nach Objekten" },
      { icon: MessageSquare, text: "Gruppenkommunikation" },
    ],
    color: "primary",
    disabled: true,
  },
  {
    id: "eigentuemer",
    icon: Home,
    title: "Eigentümer",
    subtitle: "Für Ihre eigene Immobilie",
    features: [
      { icon: Wrench, text: "Reparatur und Wartung" },
      { icon: Calendar, text: "Saisonale Arbeiten" },
      { icon: AlertTriangle, text: "Notfallreparaturen" },
      { icon: PiggyBank, text: "Budgetplanung" },
    ],
    color: "primary",
    disabled: false,
  },
  {
    id: "mieter",
    icon: User,
    title: "Mieter",
    subtitle: "Für schnelle Hilfe",
    features: [
      { icon: Wrench, text: "Kleine Reparaturen" },
      { icon: Sparkles, text: "Reinigung und Pflege" },
      { icon: Headphones, text: "Technischer Support" },
      { icon: Phone, text: "Notrufe" },
    ],
    color: "primary",
    disabled: false,
  },
]

export function ServicesSelectionSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">Unsere Leistungen</h2>
          <div className="w-20 h-1 bg-accent mx-auto mb-6"></div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">Wählen Sie Ihren Weg zur Lösung</p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <div
              key={role.id}
              className={`rounded-2xl border p-8 transition-all duration-300 flex flex-col ${
                role.disabled
                  ? "bg-muted/30 dark:bg-muted/10 border-muted/50 cursor-not-allowed opacity-75"
                  : "group bg-card dark:bg-[#1a2420] border-border hover:shadow-xl hover:border-primary/30"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon and Title */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  role.disabled
                    ? "bg-muted/50 dark:bg-muted/20"
                    : "bg-primary/10 dark:bg-primary/20 group-hover:bg-primary group-hover:scale-110"
                }`}>
                  <role.icon className={`w-7 h-7 transition-colors ${
                    role.disabled ? "text-muted-foreground" : "text-primary group-hover:text-white"
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xl font-bold ${
                      role.disabled ? "text-muted-foreground" : "text-foreground"
                    }`}>
                      {role.title}
                    </h3>
                    {role.disabled && (
                      <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full font-medium">
                        Demnächst
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    role.disabled ? "text-muted-foreground/70" : "text-muted-foreground"
                  }`}>
                    {role.subtitle}
                  </p>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8 flex-grow">
                {role.features.map((feature, idx) => (
                  <li key={idx} className={`flex items-center gap-3 ${
                    role.disabled ? "text-muted-foreground/70" : "text-muted-foreground"
                  }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      role.disabled
                        ? "bg-muted/30 dark:bg-muted/20"
                        : "bg-primary/5 dark:bg-primary/10"
                    }`}>
                      <feature.icon className={`w-4 h-4 ${
                        role.disabled ? "text-muted-foreground" : "text-primary"
                      }`} />
                    </div>
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {role.disabled ? (
                <div className="w-full py-4 px-6 bg-muted text-muted-foreground font-semibold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                  Demnächst verfügbar
                </div>
              ) : (
                <Link
                  href={`/meldung?rolle=${role.id}`}
                  className="w-full py-4 px-6 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group-hover:shadow-lg"
                >
                  Jetzt anfragen
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
