import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Lightbulb,
  Paintbrush,
  Snowflake,
  Wrench,
  Trash2,
  Package,
  Plug,
  Droplets,
  Flower2,
  Key,
  Sparkles,
  Hammer,
  Home,
  ShieldCheck,
  ArrowRight,
} from "lucide-react"

const services = [
  {
    icon: Plug,
    title: "Elektrik-Installation",
    description: "Fachgerechte elektrische Reparaturen und Installationen für Ihre Sicherheit.",
  },
  {
    icon: Paintbrush,
    title: "Malerarbeiten",
    description: "Professionelle Maler- und Tapezierarbeiten für ein frisches Aussehen Ihrer Räume.",
  },
  {
    icon: Droplets,
    title: "Klempner-Service",
    description: "Rohrreparaturen, Wartung und Installation – wir lösen Ihre Wasserprobleme.",
  },
  {
    icon: Flower2,
    title: "Gartenpflege",
    description: "Rasenmähen, Heckenschnitt und Pflanzenpflege für Ihren gepflegten Garten.",
  },
  {
    icon: Sparkles,
    title: "Reinigung",
    description: "Gründliche Reinigung Ihrer Wohn- und Geschäftsräume – sauber und hygienisch.",
  },
  {
    icon: Key,
    title: "Schlüsseldienst",
    description: "Schnelle Hilfe bei Aussperrung und professioneller Schloss-Austausch.",
  },
  {
    icon: Lightbulb,
    title: "Birne wechseln",
    description: "Schneller Austausch Ihrer Glühbirnen, damit es bei Ihnen immer hell ist.",
  },
  {
    icon: Snowflake,
    title: "Schneeräumung",
    description: "Zuverlässige Schneeräumung, damit Sie sicher durch den Winter kommen.",
  },
  {
    icon: Wrench,
    title: "Kleinreparaturen",
    description: "Kleine Reparaturen im Haushalt – schnell und unkompliziert erledigt.",
  },
  {
    icon: Trash2,
    title: "Entrümpelung",
    description: "Wir räumen auf und entsorgen, was Sie nicht mehr brauchen.",
  },
  {
    icon: Package,
    title: "Umzugshilfe",
    description: "Unterstützung beim Umzug – vom Tragen bis zum Aufbau der Möbel.",
  },
  {
    icon: Hammer,
    title: "Montagearbeiten",
    description: "Möbelaufbau, Regale und Bilder aufhängen – wir montieren alles für Sie.",
  },
  {
    icon: Home,
    title: "Hausmeisterservice",
    description: "Regelmäßige Betreuung Ihrer Immobilie mit allen anfallenden Arbeiten.",
  },
  {
    icon: ShieldCheck,
    title: "Sicherheitstechnik",
    description: "Installation von Rauchmeldern, Bewegungssensoren und Sicherheitsschlössern.",
  },
]

export default function LeistungenPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-primary py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Unsere Leistungen
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Wir bieten umfangreiche Hausmeister- und Handwerker-Dienstleistungen rund um Ihr Zuhause. Professionell,
              zuverlässig und immer für Sie da.
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Benötigen Sie unsere Hilfe?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Kontaktieren Sie uns noch heute für eine kostenlose Beratung. Wir sind rund um die Uhr für Sie erreichbar.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 h-auto text-lg transition-all duration-200 hover:scale-105 group"
            >
              <Link href="/meldung">
                Jetzt Service anfragen
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 sm:py-24 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {services.map((service, index) => (
                <Card
                  key={index}
                  className="group bg-background border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <CardContent className="p-6 sm:p-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                      <service.icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Benötigen Sie unsere Hilfe?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Kontaktieren Sie uns noch heute für eine kostenlose Beratung. Wir sind rund um die Uhr für Sie erreichbar.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 h-auto text-lg transition-all duration-200 hover:scale-105 group"
            >
              <Link href="/meldung">
                Jetzt Service anfragen
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
