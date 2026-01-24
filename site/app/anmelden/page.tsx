import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnmeldenForm } from "@/components/anmelden-form"

export default function AnmeldenPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">Willkommen zurück</h1>
              <p className="text-muted-foreground">Melden Sie sich in Ihrem Konto an</p>
            </div>
            <AnmeldenForm />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
