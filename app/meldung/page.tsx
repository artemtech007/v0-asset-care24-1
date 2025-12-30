import type { Metadata } from "next"
import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ServiceAnfragenForm } from "@/components/service-anfragen-form"

export const metadata: Metadata = {
  title: "Service anfragen - AssetCare24",
  description:
    "Melden Sie eine Storung oder ein Problem schnell und unkompliziert. Wahlen Sie Ihre Rolle und erhalten Sie schnelle Hilfe von qualifizierten Handwerkern.",
}

export default function MeldungPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Suspense fallback={<div className="bg-card rounded-2xl shadow-lg p-8 md:p-12 animate-pulse h-96" />}>
              <ServiceAnfragenForm />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
