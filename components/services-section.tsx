import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, Paintbrush, Snowflake, Wrench, Trash2, Package, ArrowRight } from "lucide-react"

const services = [
  {
    icon: Lightbulb,
    title: "Birne wechseln",
    description: "Schneller Austausch Ihrer Glühbirnen, damit es bei Ihnen immer hell ist.",
  },
  {
    icon: Paintbrush,
    title: "Tapete erneuern",
    description: "Professionelle Tapezierarbeiten für ein frisches Aussehen Ihrer Räume.",
  },
  {
    icon: Snowflake,
    title: "Schnee räumen",
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
]

export function ServicesSection() {
  return (
    <section id="leistungen" className="bg-card py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Unsere Leistungen</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Von kleinen Aufgaben bis zu größeren Projekten – wir sind für Sie da.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="group bg-background border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <CardContent className="p-6 sm:p-8">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <service.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-6 h-auto text-base transition-all duration-200 group bg-transparent"
          >
            <Link href="/leistungen">
              Alle Leistungen ansehen
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
