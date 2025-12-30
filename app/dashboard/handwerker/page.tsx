import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HandwerkerDashboard } from "@/components/handwerker-dashboard"

export default function HandwerkerDashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HandwerkerDashboard />
      <Footer />
    </main>
  )
}
