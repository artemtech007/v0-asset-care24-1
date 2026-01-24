import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { generateServicesLink } from "@/lib/source-codes"
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
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 h-auto text-lg transition-all duration-200 hover:scale-105 group mx-auto w-full max-w-sm"
            >
              <a
                href={generateServicesLink("14155238886")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                Jetzt über WhatsApp anfragen
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
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
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 h-auto text-lg transition-all duration-200 hover:scale-105 group mx-auto w-full max-w-sm"
            >
              <a
                href={generateServicesLink("14155238886")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                Jetzt über WhatsApp anfragen
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
