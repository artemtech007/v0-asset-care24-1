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
    id: "kunde",
    icon: User,
    title: "Kunde",
    subtitle: "Für private und gewerbliche Aufträge",
    features: [
      { icon: Wrench, text: "Alle Arten von Reparaturen" },
      { icon: Calendar, text: "Flexible Terminvereinbarung" },
      { icon: AlertTriangle, text: "Schnelle Notfallhilfe" },
      { icon: Sparkles, text: "Qualifizierte Fachkräfte" },
    ],
    color: "primary",
    disabled: false,
  },
  {
    id: "handwerker",
    icon: Wrench,
    title: "Handwerker",
    subtitle: "Für selbständige Fachkräfte",
    features: [
      { icon: Users, text: "Neue Kunden gewinnen" },
      { icon: FileText, text: "Professionelle Verwaltung" },
      { icon: MessageSquare, text: "Direkte Kommunikation" },
      { icon: PiggyBank, text: "Regelmäßige Aufträge" },
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
              {role.id === 'kunde' ? (
                <a
                  href="https://wa.me/14155238886?text=Ich%20möchte%20eine%20Anfrage%20stellen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group-hover:shadow-lg"
                >
                  Jetzt anfragen
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="group-hover:translate-x-1 transition-transform">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              ) : (
                <Link
                  href="/registrierung"
                  className="w-full py-4 px-6 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group-hover:shadow-lg"
                >
                  Jetzt beitreten
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
