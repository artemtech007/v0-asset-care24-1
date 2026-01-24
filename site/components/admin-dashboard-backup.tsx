"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Shield, LogOut, BarChart3, Users, FileText, PieChart, Settings } from "lucide-react"

type TabType = "uebersicht" | "benutzer" | "auftraege" | "statistiken" | "einstellungen"

// Simple working version first
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("uebersicht")
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-white/80">AssetCare24 Administration</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                onClick={() => router.push('/')}
              >
                Zur Website
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                onClick={() => router.push('/login')}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-card dark:bg-[#1a2420] border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {[
              { id: "uebersicht", label: "Übersicht", icon: BarChart3 },
              { id: "benutzer", label: "Benutzer", icon: Users },
              { id: "auftraege", label: "Aufträge", icon: FileText },
              { id: "statistiken", label: "Statistiken", icon: PieChart },
              { id: "einstellungen", label: "Einstellungen", icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Admin Dashboard</h2>
          <p className="text-muted-foreground">Dashboard is loading...</p>
        </div>
      </div>
    </div>
  )
}
