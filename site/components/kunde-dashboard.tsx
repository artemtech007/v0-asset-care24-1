"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  FileText,
  MapPin,
  Home,
  Plus,
  MessageSquare,
  Star,
  Heart,
  Settings,
  Bell,
  CreditCard,
  Mail,
  Edit,
  Trash2,
  Send,
  Euro,
  Users,
  BarChart3,
  ChevronRight,
  Smartphone,
  LogOut,
  Shield,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { VerificationPopup } from "@/components/verification-popup"

type MeldungStatus = "Offen" | "In Bearbeitung" | "Abgeschlossen" | "Entwurf"
type TabType = "uebersicht" | "anfragen" | "handwerker" | "einstellungen"

interface Meldung {
  id: number
  description: string
  status: MeldungStatus
  handwerker: string | null
  contact: string | null
  address: string
  date: string
  category: string
  rating?: number
}

interface Handwerker {
  id: number
  name: string
  specialty: string
  rating: number
  reviews: number
  phone: string
  jobsCompleted: number
}

const initialMeldungen: Meldung[] = [
  {
    id: 201,
    description: "Heizung funktioniert nicht mehr - kein warmes Wasser",
    status: "In Bearbeitung",
    handwerker: "Thomas M.",
    contact: "0151 9876543",
    address: "Musterstr. 15, Berlin",
    date: "08.12.2025",
    category: "Sanitär",
  },
  {
    id: 202,
    description: "Fenster im Schlafzimmer schließt nicht richtig",
    status: "Offen",
    handwerker: null,
    contact: null,
    address: "Musterstr. 15, Berlin",
    date: "07.12.2025",
    category: "Tischler",
  },
  {
    id: 203,
    description: "Steckdose in der Küche ohne Strom",
    status: "Abgeschlossen",
    handwerker: "Stefan K.",
    contact: "0172 1234567",
    address: "Musterstr. 15, Berlin",
    date: "01.12.2025",
    category: "Elektrik",
    rating: 5,
  },
  {
    id: 204,
    description: "Wasserhahn tropft im Badezimmer",
    status: "Abgeschlossen",
    handwerker: "Thomas M.",
    contact: "0151 9876543",
    address: "Musterstr. 15, Berlin",
    date: "25.11.2025",
    category: "Sanitär",
    rating: 4,
  },
  {
    id: 205,
    description: "Balkon-Tür klemmt",
    status: "Entwurf",
    handwerker: null,
    contact: null,
    address: "Musterstr. 15, Berlin",
    date: "10.12.2025",
    category: "Tischler",
  },
]

const initialHandwerker: Handwerker[] = [
  {
    id: 1,
    name: "Thomas M.",
    specialty: "Sanitär & Heizung",
    rating: 4.9,
    reviews: 127,
    phone: "0151 9876543",
    jobsCompleted: 3,
  },
  {
    id: 2,
    name: "Stefan K.",
    specialty: "Elektrik",
    rating: 4.8,
    reviews: 89,
    phone: "0172 1234567",
    jobsCompleted: 1,
  },
  {
    id: 3,
    name: "Michael R.",
    specialty: "Maler & Lackierer",
    rating: 4.7,
    reviews: 64,
    phone: "0163 4567890",
    jobsCompleted: 2,
  },
  {
    id: 4,
    name: "Andreas B.",
    specialty: "Tischler",
    rating: 4.9,
    reviews: 112,
    phone: "0176 2345678",
    jobsCompleted: 0,
  },
  {
    id: 5,
    name: "Klaus W.",
    specialty: "Garten & Landschaft",
    rating: 4.6,
    reviews: 45,
    phone: "0157 8901234",
    jobsCompleted: 1,
  },
]

const statusConfig = {
  Offen: {
    icon: AlertCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-900",
  },
  "In Bearbeitung": {
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-900",
  },
  Abgeschlossen: {
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-900",
  },
  Entwurf: {
    icon: FileText,
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-950/30",
    border: "border-gray-200 dark:border-gray-800",
  },
}

export function KundeDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("uebersicht")
  const [meldungen, setMeldungen] = useState<Meldung[]>(initialMeldungen)
  const [filter, setFilter] = useState<"alle" | MeldungStatus>("alle")
  const [favorites, setFavorites] = useState<Handwerker[]>(initialHandwerker)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [selectedMeldung, setSelectedMeldung] = useState<Meldung | null>(null)
  const [ratingValue, setRatingValue] = useState(0)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [contactMessage, setContactMessage] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [notifications, setNotifications] = useState({
    email: true,
    whatsapp: true,
    push: false,
  })
  const [profileSaved, setProfileSaved] = useState(false)
  const customerName = "Anna Schmidt"

  const [showVerification, setShowVerification] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    const verified = localStorage.getItem("kunde_verified")
    if (verified === "true") {
      setIsVerified(true)
    } else {
      const timer = setTimeout(() => {
        setShowVerification(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleVerificationComplete = () => {
    setIsVerified(true)
    setShowVerification(false)
    localStorage.setItem("kunde_verified", "true")
  }

  const openMeldungen = meldungen.filter((m) => m.status === "Offen").length
  const inProgressMeldungen = meldungen.filter((m) => m.status === "In Bearbeitung").length
  const completedMeldungen = meldungen.filter((m) => m.status === "Abgeschlossen").length
  const draftMeldungen = meldungen.filter((m) => m.status === "Entwurf").length
  const totalExpenses = 450

  const filteredMeldungen = meldungen.filter((m) => {
    if (filter === "alle") return true
    return m.status === filter
  })

  const handleSendDraft = (id: number) => {
    setMeldungen(meldungen.map((m) => (m.id === id ? { ...m, status: "Offen" as MeldungStatus } : m)))
  }

  const handleDeleteMeldung = () => {
    if (deleteId) {
      setMeldungen(meldungen.filter((m) => m.id !== deleteId))
      setShowDeleteConfirm(false)
      setDeleteId(null)
    }
  }

  const handleOpenRating = (meldung: Meldung) => {
    setSelectedMeldung(meldung)
    setRatingValue(0)
    setShowRatingDialog(true)
  }

  const handleSubmitRating = () => {
    if (selectedMeldung && ratingValue > 0) {
      setMeldungen(meldungen.map((m) => (m.id === selectedMeldung.id ? { ...m, rating: ratingValue } : m)))
      setShowRatingDialog(false)
      setSelectedMeldung(null)
    }
  }

  const handleOpenContact = (meldung: Meldung) => {
    setSelectedMeldung(meldung)
    setContactMessage("")
    setShowContactDialog(true)
  }

  const handleSendMessage = () => {
    setShowContactDialog(false)
    setSelectedMeldung(null)
    setContactMessage("")
    alert("Nachricht wurde gesendet!")
  }

  const handleRemoveFavorite = (id: number) => {
    setFavorites(favorites.filter((f) => f.id !== id))
  }

  const handleSaveProfile = () => {
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  const handleLogout = () => {
    router.push("/anmelden")
  }

  const tabs = [
    { id: "uebersicht" as TabType, label: "Mein Überblick", icon: BarChart3 },
    { id: "anfragen" as TabType, label: "Anfragen verwalten", icon: FileText },
    { id: "handwerker" as TabType, label: "Handwerker", icon: Users },
    { id: "einstellungen" as TabType, label: "Einstellungen", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      <VerificationPopup
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        onVerify={handleVerificationComplete}
      />

      {!isVerified && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-amber-600" />
              <span className="text-sm text-amber-800 dark:text-amber-200">
                Bitte bestätigen Sie Ihr Konto, um alle Funktionen zu nutzen
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-600 text-amber-700 hover:bg-amber-100 bg-transparent"
              onClick={() => setShowVerification(true)}
            >
              Jetzt bestätigen
            </Button>
          </div>
        </div>
      )}

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Block */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-primary">Willkommen, {customerName}!</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  Kunden Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href="https://wa.me/14155238886?text=Ich%20möchte%20eine%20Anfrage%20stellen" target="_blank" rel="noopener noreferrer">
                <Button className="bg-accent hover:bg-accent/90 text-white rounded-full px-6">
                  <Plus className="w-4 h-4 mr-2" />
                  Neue Anfrage
                </Button>
              </a>
              <Button variant="outline" onClick={handleLogout} className="bg-transparent">
                <LogOut className="w-4 h-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 bg-card dark:bg-[#1a2420] p-2 rounded-xl border border-border">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          {activeTab === "uebersicht" && (
            <div className="space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card dark:bg-[#1a2420] border border-border rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">Aktuelle Anfragen</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{openMeldungen + inProgressMeldungen}</p>
                </div>
                <div className="bg-card dark:bg-[#1a2420] border border-border rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">Bevorzugte Handwerker</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{favorites.length}</p>
                </div>
                <div className="bg-card dark:bg-[#1a2420] border border-border rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                      <Euro className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">Ausgaben (Monat)</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{totalExpenses}</p>
                </div>
                <div className="bg-card dark:bg-[#1a2420] border border-border rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">Bewertungen</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">4.8</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Schnellzugriff</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab("anfragen")}
                    className="bg-card dark:bg-[#1a2420] border border-border rounded-xl p-5 flex items-center justify-between hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="font-medium">Anfragen verwalten</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => setActiveTab("handwerker")}
                    className="bg-card dark:bg-[#1a2420] border border-border rounded-xl p-5 flex items-center justify-between hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="font-medium">Meine Handwerker</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => setActiveTab("einstellungen")}
                    className="bg-card dark:bg-[#1a2420] border border-border rounded-xl p-5 flex items-center justify-between hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-primary" />
                      <span className="font-medium">Einstellungen</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Recent Requests */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Aktuelle Anfragen</h2>
                  <button
                    onClick={() => setActiveTab("anfragen")}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    Alle anzeigen <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {meldungen
                    .filter((m) => m.status !== "Abgeschlossen" && m.status !== "Entwurf")
                    .slice(0, 2)
                    .map((meldung) => {
                      const status = statusConfig[meldung.status]
                      const StatusIcon = status.icon
                      return (
                        <div
                          key={meldung.id}
                          className={`bg-card dark:bg-[#1a2420] rounded-xl border ${status.border} p-5`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted-foreground">#{meldung.id}</span>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bg}`}>
                              <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                              <span className={`text-xs font-medium ${status.color}`}>{meldung.status}</span>
                            </div>
                          </div>
                          <p className="font-medium text-foreground mb-2 line-clamp-2">{meldung.description}</p>
                          <p className="text-sm text-muted-foreground">{meldung.date}</p>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "anfragen" && (
            <div className="space-y-6">
              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "alle", label: "Alle", count: meldungen.length },
                  { id: "Offen", label: "Offen", count: openMeldungen },
                  { id: "In Bearbeitung", label: "In Bearbeitung", count: inProgressMeldungen },
                  { id: "Abgeschlossen", label: "Abgeschlossen", count: completedMeldungen },
                  { id: "Entwurf", label: "Entwürfe", count: draftMeldungen },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setFilter(filter.id as typeof filter)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filter.id === filter
                        ? "bg-primary text-white"
                        : "bg-card dark:bg-[#1a2420] border border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>

              {/* Requests List */}
              {filteredMeldungen.length === 0 ? (
                <div className="bg-card dark:bg-[#1a2420] rounded-2xl border border-border p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Keine Anfragen</h3>
                  <p className="text-muted-foreground">In dieser Kategorie gibt es keine Anfragen.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {filteredMeldungen.map((meldung) => {
                    const status = statusConfig[meldung.status]
                    const StatusIcon = status.icon

                    return (
                      <div
                        key={meldung.id}
                        className={`bg-card dark:bg-[#1a2420] rounded-2xl border ${status.border} p-6 transition-all duration-300 hover:shadow-lg`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">#{meldung.id}</span>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {meldung.category}
                            </span>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg}`}>
                            <StatusIcon className={`w-4 h-4 ${status.color}`} />
                            <span className={`text-sm font-medium ${status.color}`}>{meldung.status}</span>
                          </div>
                        </div>

                        <p className="font-medium text-foreground mb-4">{meldung.description}</p>

                        <div className="space-y-2 mb-5 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{meldung.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{meldung.date}</span>
                          </div>
                          {meldung.handwerker && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground font-medium">{meldung.handwerker}</span>
                            </div>
                          )}
                        </div>

                        {/* Rating for completed */}
                        {meldung.status === "Abgeschlossen" && meldung.rating && (
                          <div className="flex items-center gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < meldung.rating! ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                              />
                            ))}
                            <span className="text-sm text-muted-foreground ml-1">Ihre Bewertung</span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {meldung.status === "Entwurf" && (
                            <>
                              <Button
                                size="sm"
                                className="flex-1 bg-primary hover:bg-primary/90"
                                onClick={() => handleSendDraft(meldung.id)}
                              >
                                <Send className="w-4 h-4 mr-1" />
                                Absenden
                              </Button>
                              <Link href={`/meldung?edit=${meldung.id}`}>
                                <Button size="sm" variant="outline" className="border-border bg-transparent">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30 bg-transparent"
                                onClick={() => {
                                  setDeleteId(meldung.id)
                                  setShowDeleteConfirm(true)
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {(meldung.status === "Offen" || meldung.status === "In Bearbeitung") &&
                            meldung.handwerker && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-primary/30 text-primary bg-transparent"
                                onClick={() => handleOpenContact(meldung)}
                              >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Kontaktieren
                              </Button>
                            )}
                          {meldung.status === "Abgeschlossen" && !meldung.rating && (
                            <Button
                              size="sm"
                              className="flex-1 bg-primary hover:bg-primary/90"
                              onClick={() => handleOpenRating(meldung)}
                            >
                              <Star className="w-4 h-4 mr-1" />
                              Bewerten
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "handwerker" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Meine Favoriten</h2>
                <span className="text-sm text-muted-foreground">{favorites.length} Handwerker</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {favorites.map((hw) => (
                  <div
                    key={hw.id}
                    className="bg-card dark:bg-[#1a2420] rounded-2xl border border-border p-6 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{hw.name}</h3>
                          <p className="text-sm text-muted-foreground">{hw.specialty}</p>
                        </div>
                      </div>
                      <button className="text-red-500 hover:text-red-600" onClick={() => handleRemoveFavorite(hw.id)}>
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{hw.rating}</span>
                        <span className="text-muted-foreground">({hw.reviews})</span>
                      </div>
                      <span className="text-muted-foreground">{hw.jobsCompleted} Aufträge</span>
                    </div>

                    <div className="flex gap-2">
                      <a href={`tel:${hw.phone.replace(/\s/g, "")}`} className="flex-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-primary/30 text-primary bg-transparent"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Anrufen
                        </Button>
                      </a>
                      <Link href={`/meldung?handwerker=${hw.id}`} className="flex-1">
                        <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                          Anfrage
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New */}
              <div className="bg-card dark:bg-[#1a2420] rounded-2xl border border-dashed border-border p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Handwerker vorschlagen</h3>
                <p className="text-muted-foreground mb-4">
                  Kennen Sie einen guten Handwerker? Schlagen Sie ihn für die Plattform vor.
                </p>
                <Link href="/registrierung?role=handwerker">
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Handwerker vorschlagen
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {activeTab === "einstellungen" && (
            <div className="space-y-6">
              {profileSaved && (
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 dark:text-green-400">Einstellungen wurden gespeichert!</span>
                </div>
              )}

              {/* Profile Section */}
              <div className="bg-card dark:bg-[#1a2420] rounded-2xl border border-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Profil</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Name</label>
                    <input
                      type="text"
                      defaultValue="Anna Schmidt"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-[#0f1512] focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">E-Mail</label>
                    <input
                      type="email"
                      defaultValue="anna.schmidt@email.de"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-[#0f1512] focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Telefon</label>
                    <input
                      type="tel"
                      defaultValue="+49 151 12345678"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-[#0f1512] focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Adresse</label>
                    <input
                      type="text"
                      defaultValue="Musterstr. 15, 10115 Berlin"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-[#0f1512] focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <Button className="mt-6 bg-primary hover:bg-primary/90" onClick={handleSaveProfile}>
                  Speichern
                </Button>
              </div>

              {/* Notifications */}
              <div className="bg-card dark:bg-[#1a2420] rounded-2xl border border-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Benachrichtigungen</h2>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      key: "email",
                      icon: Mail,
                      label: "E-Mail Benachrichtigungen",
                      description: "Updates zu Ihren Anfragen",
                    },
                    {
                      key: "whatsapp",
                      icon: MessageSquare,
                      label: "WhatsApp Nachrichten",
                      description: "Wichtige Statusänderungen",
                    },
                    {
                      key: "push",
                      icon: Smartphone,
                      label: "Push-Benachrichtigungen",
                      description: "Sofortige Updates",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Preferences */}
              <div className="bg-card dark:bg-[#1a2420] rounded-2xl border border-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Präferenzen</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Bevorzugte Zahlungsmethode</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-[#0f1512] focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option>Überweisung</option>
                      <option>PayPal</option>
                      <option>Kreditkarte</option>
                      <option>Barzahlung</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Kommunikationssprache</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-[#0f1512] focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option>Deutsch</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>
                <Button className="mt-6 bg-primary hover:bg-primary/90" onClick={handleSaveProfile}>
                  Speichern
                </Button>
              </div>

              <div className="bg-card dark:bg-[#1a2420] rounded-2xl border border-red-200 dark:border-red-900 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <LogOut className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-semibold text-foreground">Konto</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30 bg-transparent"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Abmelden
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30 bg-transparent"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Konto löschen
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle>Handwerker bewerten</DialogTitle>
            <DialogDescription>
              Wie zufrieden waren Sie mit der Arbeit von {selectedMeldung?.handwerker}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRatingValue(star)}>
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= ratingValue ? "text-yellow-500 fill-yellow-500" : "text-gray-300 hover:text-yellow-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-muted-foreground">
              {ratingValue === 0 && "Klicken Sie auf einen Stern"}
              {ratingValue === 1 && "Sehr schlecht"}
              {ratingValue === 2 && "Schlecht"}
              {ratingValue === 3 && "Okay"}
              {ratingValue === 4 && "Gut"}
              {ratingValue === 5 && "Ausgezeichnet"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowRatingDialog(false)}>
              Abbrechen
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleSubmitRating}
              disabled={ratingValue === 0}
            >
              Bewertung abgeben
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle>Nachricht senden</DialogTitle>
            <DialogDescription>Senden Sie eine Nachricht an {selectedMeldung?.handwerker}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Ihre Nachricht..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-[#0f1512] focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px]"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowContactDialog(false)}>
              Abbrechen
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleSendMessage}
              disabled={!contactMessage.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              Senden
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle>Anfrage löschen?</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie diese Anfrage löschen möchten? Diese Aktion kann nicht rückgängig gemacht
              werden.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowDeleteConfirm(false)}>
              Abbrechen
            </Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteMeldung}>
              <Trash2 className="w-4 h-4 mr-2" />
              Löschen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
