import { Card, CardContent } from "@/components/ui/card"
import { Quote, Building2, Home, User, Wrench } from "lucide-react"

const testimonials = [
  {
    quote:
      "AssetCare24 hat meine Arbeit komplett verändert. Alle Objekte übersichtlich, Kommunikation transparent, Handwerker zuverlässig. Endlich Ordnung in der Hausverwaltung!",
    author: "Anna M.",
    role: "Hausverwalterin",
    location: "Berlin",
    icon: Building2,
  },
  {
    quote:
      "Als Hausbesitzer schätze ich die Übersichtlichkeit. Von der kleinen Reparatur bis zur Gartenpflege - alles organisiert und nachvollziehbar.",
    author: "Thomas K.",
    role: "Eigentümer",
    location: "München",
    icon: Home,
  },
  {
    quote:
      "Super einfach! Foto gemacht, Problem beschrieben - und schon kommt der Handwerker. Kein Stress mehr mit Wohnungsschäden.",
    author: "Maria S.",
    role: "Mieterin",
    location: "Hamburg",
    icon: User,
  },
  {
    quote:
      "Durch AssetCare24 habe ich stabile Kundschaft gefunden. Die Plattform macht alles transparent und die Kunden sind zufrieden.",
    author: "Michael R.",
    role: "Elektriker",
    location: "Köln",
    icon: Wrench,
  },
]

export function TestimonialsSection() {
  return (
    <section id="kundenmeinungen" className="bg-background py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Was unsere Nutzer sagen</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Erfahrungen aus der Praxis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => {
            const IconComponent = testimonial.icon
            return (
              <Card
                key={index}
                className="bg-card dark:bg-[#1a2420] border-border hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: "backwards" }}
              >
                <CardContent className="p-6 sm:p-8">
                  <Quote className="h-8 w-8 text-accent/30 mb-4" />
                  <blockquote className="text-foreground text-lg leading-relaxed mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.author}</p>
                      <p className="text-sm text-primary font-medium">{testimonial.role}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
