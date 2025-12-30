import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HandwerkerRegistrierungForm } from "@/components/handwerker-registrierung-form"

export default function HandwerkerRegistrierenPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Als Handwerker registrieren</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Werden Sie Teil unseres Netzwerks und erhalten Sie Zugang zu stabilen Aufträgen und zufriedenen Kunden.
            </p>
          </div>
          <HandwerkerRegistrierungForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
