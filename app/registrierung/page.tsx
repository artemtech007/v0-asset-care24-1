import type { Metadata } from "next"
import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RegistrierungForm } from "@/components/registrierung-form"

export const metadata: Metadata = {
  title: "Registrierung - AssetCare24",
  description:
    "Erstellen Sie ein Konto bei AssetCare24, um Ihre Aufträge zu verwalten und schneller Service anzufragen.",
}

function RegistrierungFormSkeleton() {
  return (
    <div className="bg-card dark:bg-[#1a2420] rounded-2xl shadow-xl p-8 animate-pulse">
      <div className="h-6 bg-muted rounded w-1/3 mb-6"></div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="h-32 bg-muted rounded-xl"></div>
        <div className="h-32 bg-muted rounded-xl"></div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded w-1/4"></div>
        <div className="h-12 bg-muted rounded-full"></div>
        <div className="h-4 bg-muted rounded w-1/4"></div>
        <div className="h-12 bg-muted rounded-full"></div>
      </div>
    </div>
  )
}

export default function RegistrierungPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4">Jetzt registrieren</h1>
              <p className="text-muted-foreground text-lg">
                Erstellen Sie ein Konto, um AssetCare24 optimal zu nutzen. Die Registrierung dauert nur wenige Minuten.
              </p>
            </div>

            <Suspense fallback={<RegistrierungFormSkeleton />}>
              <RegistrierungForm />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
