import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { KundeDashboard } from "@/components/kunde-dashboard"

export default function KundeDashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <KundeDashboard />
      <Footer />
    </main>
  )
}
