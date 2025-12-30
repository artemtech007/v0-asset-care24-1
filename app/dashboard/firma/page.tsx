import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FirmaDashboard } from "@/components/firma-dashboard"

export default function FirmaDashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <FirmaDashboard />
      <Footer />
    </main>
  )
}
