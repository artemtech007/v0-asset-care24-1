import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { JobsHero } from "@/components/jobs-hero"
import { JobsBenefits } from "@/components/jobs-benefits"
import { JobsList } from "@/components/jobs-list"
import { JobsApplicationForm } from "@/components/jobs-application-form"

export const metadata = {
  title: "Jobs - AssetCare24 | Arbeiten mit uns",
  description:
    "Werden Sie Teil des AssetCare24 Teams. Flexible Arbeitszeiten, stabile Auftragslage und ein freundliches Arbeitsumfeld.",
}

export default function JobsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <JobsHero />
        <JobsBenefits />
        <JobsList />
        <JobsApplicationForm />
      </main>
      <Footer />
    </div>
  )
}
