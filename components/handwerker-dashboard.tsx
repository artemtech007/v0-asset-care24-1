"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  User,
  Phone,
  FileText,
  MapPin,
  Briefcase,
  LayoutDashboard,
  Euro,
  Star,
  Calendar,
  ImageIcon,
  Award,
  Settings,
  TrendingUp,
  FileCheck,
  Camera,
  MessageSquare,
  Plane,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Send,
  LogOut,
  Upload,
  Download,
  Plus,
  Shield,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input" // Added Input
import { Label } from "@/components/ui/label" // Added Label
import { Textarea } from "@/components/ui/textarea" // Added Textarea
import { VerificationPopup } from "@/components/verification-popup" // Added VerificationPopup

type OrderStatus = "Offen" | "In Bearbeitung" | "Abgeschlossen"
type TabType = "dashboard" | "auftraege" | "finanzen" | "portfolio" | "kalender"

interface Order {
  id: number
  description: string
  status: OrderStatus
  customer: string
  contact: string
  address: string
  date: string
  price?: number
}

const initialOrders: Order[] = [
  {
    id: 101,
    description: "Lampe wechseln im Flur",
    status: "Offen",
    customer: "Anna K.",
    contact: "0151 2345678",
    address: "Berliner Str. 12, Berlin",
    date: "08.12.2025",
    price: 45,
  },
  {
    id: 102,
    description: "Wasserhahn tropft in der Küche - dringend reparieren",
    status: "In Bearbeitung",
    customer: "Peter M.",
    contact: "0172 9876543",
    address: "Hauptstr. 45, München",
    date: "07.12.2025",
    price: 85,
  },
  {
    id: 103,
    description: "Tapete im Wohnzimmer erneuern, ca. 25 m²",
    status: "Offen",
    customer: "Maria S.",
    contact: "0163 1122334",
    address: "Gartenweg 8, Hamburg",
    date: "06.12.2025",
    price: 320,
  },
  {
    id: 104,
    description: "Winterdienst - Schnee räumen vor dem Haus",
    status: "Abgeschlossen",
    customer: "Hans B.",
    contact: "0157 5566778",
    address: "Lindenallee 22, Köln",
    date: "05.12.2025",
    price: 60,
  },
  {
    id: 105,
    description: "Gartenpflege: Hecke schneiden und Laub entfernen",
    status: "Abgeschlossen",
    customer: "Erika W.",
    contact: "0176 4433221",
    address: "Rosenweg 3, Frankfurt",
    date: "04.12.2025",
    price: 95,
  },
]

const reviews = [
  {
    id: 1,
    customer: "Anna K.",
    rating: 5,
    comment: "Sehr professionell und pünktlich. Arbeit perfekt erledigt!",
    date: "05.12.2025",
  },
  { id: 2, customer: "Peter M.", rating: 4, comment: "Gute Arbeit, freundlicher Service.", date: "03.12.2025" },
  { id: 3, customer: "Hans B.", rating: 5, comment: "Absolut zuverlässig, komme gerne wieder!", date: "01.12.2025" },
]

const portfolioPhotos = [
  {
    id: 1,
    title: "Badezimmer Renovierung",
    before: "/pre-renovation-bathroom.png",
    after: "/bathroom-after-renovation-modern.jpg",
  },
  {
    id: 2,
    title: "Küche Modernisierung",
    before: "/pre-renovation-kitchen.png",
    after: "/kitchen-after-renovation-modern.jpg",
  },
]

const certificates = [
  { id: 1, name: "Elektrofachkraft", issuer: "IHK Berlin", date: "2020" },
  { id: 2, name: "Sanitär-Grundkurs", issuer: "HWK München", date: "2019" },
]

const monthlyEarnings = [
  { month: "Jul", amount: 2800 },
  { month: "Aug", amount: 3200 },
  { month: "Sep", amount: 2950 },
  { month: "Okt", amount: 3400 },
  { month: "Nov", amount: 3100 },
  { month: "Dez", amount: 1250 },
]

const statusConfig = {
  Offen: {
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-900",
  },
  "In Bearbeitung": {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-900",
  },
  Abgeschlossen: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-900",
  },
}

export function HandwerkerDashboard() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [activeTab, setActiveTab] = useState<TabType>("dashboard")
  const [orderFilter, setOrderFilter] = useState<"all" | "Offen" | "In Bearbeitung" | "Abgeschlossen">("all")
  const [availability, setAvailability] = useState<"available" | "busy" | "vacation">("available")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [messageText, setMessageText] = useState("")
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [showCertUpload, setShowCertUpload] = useState(false)
  const [vacationStart, setVacationStart] = useState("")
  const [vacationEnd, setVacationEnd] = useState("")
  const [vacationDaysState, setVacationDaysState] = useState([24, 25, 26, 27, 28, 29, 30, 31])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [showDayDialog, setShowDayDialog] = useState(false)
  const [showAddAppointment, setShowAddAppointment] = useState(false)
  const [newAppointment, setNewAppointment] = useState({ title: "", time: "", customer: "", address: "" })
  const [appointments, setAppointments] = useState<{
    [key: number]: { title: string; time: string; customer: string; address: string }[]
  }>({
    8: [{ title: "Lampe installieren", time: "09:00", customer: "Anna K.", address: "Berliner Str. 12" }],
    12: [{ title: "Wasserhahn reparieren", time: "14:00", customer: "Peter M.", address: "Hauptstr. 45" }],
    15: [{ title: "Steckdose erneuern", time: "10:30", customer: "Maria S.", address: "Gartenweg 8" }],
    18: [{ title: "Heizung warten", time: "11:00", customer: "Hans B.", address: "Lindenallee 22" }],
    22: [{ title: "Türschloss austauschen", time: "15:00", customer: "Erika W.", address: "Rosenweg 3" }],
  })
  const [bookedDays, setBookedDays] = useState([8, 12, 15, 18, 22])

  // Added verification state
  const [showVerification, setShowVerification] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    const verified = localStorage.getItem("handwerker_verified")
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
    localStorage.setItem("handwerker_verified", "true")
  }

  const masterName = "Max Mustermann"

  const handleStatusChange = (orderId: number, newStatus: OrderStatus) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const handleRejectOrder = (orderId: number) => {
    setOrders(orders.filter((order) => order.id !== orderId))
  }

  const handleOpenMessage = (order: Order) => {
    setSelectedOrder(order)
    setMessageText("")
    setShowMessageDialog(true)
  }

  const handleSendMessage = () => {
    setShowMessageDialog(false)
    setSelectedOrder(null)
    alert("Nachricht wurde gesendet!")
  }

  const handleOpenInvoice = (order: Order) => {
    setSelectedOrder(order)
    setShowInvoiceDialog(true)
  }

  const handleCreateInvoice = () => {
    setShowInvoiceDialog(false)
    alert("Rechnung wurde erstellt und per E-Mail versendet!")
  }

  const handleAddVacation = () => {
    if (vacationStart && vacationEnd) {
      const start = new Date(vacationStart)
      const end = new Date(vacationEnd)
      const newVacationDays: number[] = []
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        newVacationDays.push(d.getDate())
      }
      setVacationDaysState([...vacationDaysState, ...newVacationDays])
      setVacationStart("")
      setVacationEnd("")
      alert("Urlaub wurde eingetragen!")
    }
  }

  const handleDayClick = (day: number | null) => {
    if (day === null) return
    setSelectedDay(day)
    setShowDayDialog(true)
  }

  const handleAddAppointment = () => {
    if (selectedDay && newAppointment.title && newAppointment.time) {
      setAppointments((prev) => ({
        ...prev,
        [selectedDay]: [...(prev[selectedDay] || []), newAppointment],
      }))
      if (!bookedDays.includes(selectedDay)) {
        setBookedDays((prev) => [...prev, selectedDay])
      }
      setNewAppointment({ title: "", time: "", customer: "", address: "" })
      setShowAddAppointment(false)
      alert("Termin wurde hinzugefügt!")
    }
  }

  const handleRemoveVacation = (day: number) => {
    setVacationDaysState((prev) => prev.filter((d) => d !== day))
  }

  const handleLogout = () => {
    router.push("/anmelden")
  }

  const handleDownloadTaxDocs = () => {
    alert("Steuerunterlagen werden heruntergeladen...")
  }

  const openOrders = orders.filter((o) => o.status === "Offen").length
  const inProgressOrders = orders.filter((o) => o.status === "In Bearbeitung").length
  const completedOrders = orders.filter((o) => o.status === "Abgeschlossen").length

  const todayEarnings = orders
    .filter((o) => o.status === "Abgeschlossen" && o.date === "08.12.2025")
    .reduce((sum, o) => sum + (o.price || 0), 0)
  const totalEarnings = orders.filter((o) => o.status === "Abgeschlossen").reduce((sum, o) => sum + (o.price || 0), 0)
  const pendingPayments =
    orders.filter((o) => o.status === "Abgeschlossen").reduce((sum, o) => sum + (o.price || 0), 0) * 0.3
  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)

  const filteredOrders = orderFilter === "all" ? orders : orders.filter((o) => o.status === orderFilter)

  const tabs = [
    { id: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard },
    { id: "auftraege" as TabType, label: "Aufträge", icon: Briefcase },
    { id: "finanzen" as TabType, label: "Finanzen", icon: Euro },
    { id: "portfolio" as TabType, label: "Portfolio", icon: ImageIcon },
    { id: "kalender" as TabType, label: "Kalender", icon: Calendar },
  ]

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    // Add empty slots for days before the first day of month
    for (let i = 0; i < (firstDay.getDay() || 7) - 1; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i)
    }

    return days
  }

  return (
    <section className="py-8 md:py-12">
      {/* Added verification popup */}
      <VerificationPopup
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        onVerify={handleVerificationComplete}
        contactMethod="email"
      />

      {/* Added verification banner */}
      {!isVerified && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 mb-4">
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Block */}
        <div className="mb-8 flex flex-col sm:flex-col sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary">Willkommen, {masterName}!</h1>
              <p className="text-sm text-muted-foreground">Handwerker Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`bg-transparent ${
                    availability === "available"
                      ? "border-green-500 text-green-600"
                      : availability === "busy"
                        ? "border-amber-500 text-amber-600"
                        : "border-blue-500 text-blue-600"
                  }`}
                >
                  {availability === "available" ? "Verfügbar" : availability === "busy" ? "Beschäftigt" : "Urlaub"}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setAvailability("available")}>
                  <Check className="w-4 h-4 mr-2 text-green-600" /> Verfügbar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAvailability("busy")}>
                  <Clock className="w-4 h-4 mr-2 text-amber-600" /> Beschäftigt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAvailability("vacation")}>
                  <Plane className="w-4 h-4 mr-2 text-blue-600" /> Urlaub
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={handleLogout} className="bg-transparent">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-1 mb-8 overflow-x-auto pb-2 border-b border-border">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all rounded-t-lg ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">Aktive Aufträge</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{openOrders + inProgressOrders}</p>
              </div>

              <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Euro className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">Heutiger Verdienst</span>
                </div>
                <p className="text-3xl font-bold text-foreground">€{todayEarnings || 120}</p>
              </div>

              <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">Bewertung</span>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {avgRating} <span className="text-lg text-yellow-500">★</span>
                </p>
              </div>

              <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      availability === "available"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : availability === "busy"
                          ? "bg-amber-100 dark:bg-amber-900/30"
                          : "bg-blue-100 dark:bg-blue-900/30"
                    }`}
                  >
                    {availability === "available" ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : availability === "busy" ? (
                      <Clock className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Plane className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">Verfügbarkeit</span>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {availability === "available" ? "Frei" : availability === "busy" ? "Beschäftigt" : "Urlaub"}
                </p>
              </div>
            </div>

            {/* Recent Orders & Recent Reviews */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Neueste Aufträge
                </h3>
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => {
                    const status = statusConfig[order.status]
                    return (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-foreground text-sm">{order.description.slice(0, 30)}...</p>
                          <p className="text-xs text-muted-foreground">
                            {order.customer} • {order.date}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                          {order.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-primary" onClick={() => setActiveTab("auftraege")}>
                  Alle Aufträge anzeigen
                </Button>
              </div>

              {/* Recent Reviews */}
              <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Neueste Bewertungen
                </h3>
                <div className="space-y-3">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground text-sm">{review.customer}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-primary" onClick={() => setActiveTab("portfolio")}>
                  Alle Bewertungen anzeigen
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "auftraege" && (
          <div className="space-y-6">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "Alle", count: orders.length },
                { value: "Offen", label: "Offene", count: openOrders },
                { value: "In Bearbeitung", label: "In Bearbeitung", count: inProgressOrders },
                { value: "Abgeschlossen", label: "Abgeschlossen", count: completedOrders },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setOrderFilter(filter.value as typeof orderFilter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    orderFilter === filter.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status]
                const StatusIcon = status.icon

                return (
                  <div
                    key={order.id}
                    className={`bg-card dark:bg-[#1a2420] rounded-2xl border ${status.border} p-6 transition-all duration-300 hover:shadow-lg`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-muted-foreground">Auftrag #{order.id}</span>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg}`}>
                        <StatusIcon className={`w-4 h-4 ${status.color}`} />
                        <span className={`text-sm font-medium ${status.color}`}>{order.status}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-foreground font-medium leading-relaxed">{order.description}</p>
                      {order.price && <p className="text-lg font-bold text-primary mt-2">€{order.price}</p>}
                    </div>

                    <div className="space-y-2 mb-5 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{order.customer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a href={`tel:${order.contact.replace(/\s/g, "")}`} className="text-primary hover:underline">
                          {order.contact}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{order.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{order.date}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {order.status === "Offen" && (
                        <>
                          <Button
                            size="sm"
                            className="flex-1 bg-primary hover:bg-primary/90"
                            onClick={() => handleStatusChange(order.id, "In Bearbeitung")}
                          >
                            <Check className="w-4 h-4 mr-1" /> Annehmen
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                            onClick={() => handleRejectOrder(order.id)}
                          >
                            <X className="w-4 h-4 mr-1" /> Ablehnen
                          </Button>
                        </>
                      )}
                      {order.status === "In Bearbeitung" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => handleOpenMessage(order)}
                          >
                            <Send className="w-4 h-4 mr-1" /> Nachricht
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusChange(order.id, "Abgeschlossen")}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Abschließen
                          </Button>
                        </>
                      )}
                      {order.status === "Abgeschlossen" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => handleOpenInvoice(order)}
                        >
                          <FileText className="w-4 h-4 mr-1" /> Rechnung erstellen
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === "finanzen" && (
          <div className="space-y-6">
            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-muted-foreground">Gesamtverdienst</span>
                </div>
                <p className="text-3xl font-bold text-foreground">€{totalEarnings}</p>
                <p className="text-sm text-green-600 mt-1">+12% vs. letzter Monat</p>
              </div>

              <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-muted-foreground">Ausstehend</span>
                </div>
                <p className="text-3xl font-bold text-foreground">€{pendingPayments.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground mt-1">2 Rechnungen offen</p>
              </div>

              <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-muted-foreground">Steuerunterlagen</span>
                </div>
                <p className="text-xl font-bold text-foreground">2025</p>
                <Button size="sm" variant="link" className="text-primary p-0 mt-1" onClick={handleDownloadTaxDocs}>
                  <Download className="w-4 h-4 mr-1" />
                  Herunterladen
                </Button>
              </div>
            </div>

            {/* Monthly Earnings Chart */}
            <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Verdienst nach Monaten</h3>
              <div className="flex items-end justify-between gap-2 h-48">
                {monthlyEarnings.map((item, index) => {
                  const maxAmount = Math.max(...monthlyEarnings.map((e) => e.amount))
                  const height = (item.amount / maxAmount) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs text-muted-foreground">€{item.amount}</span>
                      <div
                        className="w-full bg-primary/80 rounded-t-lg transition-all hover:bg-primary"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{item.month}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Letzte Zahlungen</h3>
              <div className="space-y-3">
                {orders
                  .filter((o) => o.status === "Abgeschlossen")
                  .map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-foreground">{order.description.slice(0, 40)}...</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer} • {order.date}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-green-600">+€{order.price}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "portfolio" && (
          <div className="space-y-8">
            {/* Work Photos */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Arbeitsfotos (Vorher/Nachher)
                </h3>
                <Button size="sm" variant="outline" onClick={() => setShowPhotoUpload(true)}>
                  <Camera className="w-4 h-4 mr-2" /> Foto hinzufügen
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {portfolioPhotos.map((photo) => (
                  <div key={photo.id} className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-4">
                    <h4 className="font-medium text-foreground mb-3">{photo.title}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Vorher</p>
                        <img
                          src={photo.before || "/placeholder.svg"}
                          alt="Vorher"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Nachher</p>
                        <img
                          src={photo.after || "/placeholder.svg"}
                          alt="Nachher"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Kundenbewertungen
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-foreground">{review.customer}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">{review.comment}</p>
                    <p className="text-xs text-muted-foreground mt-3">{review.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificates */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Zertifikate & Qualifikationen
                </h3>
                <Button size="sm" variant="outline" onClick={() => setShowCertUpload(true)}>
                  <FileText className="w-4 h-4 mr-2" /> Zertifikat hochladen
                </Button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-5 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{cert.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {cert.issuer} • {cert.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "kalender" && (
          <div className="space-y-6">
            {/* Availability Settings */}
            <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Arbeitszeiten
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Mo-Fr", "Sa", "So", "Feiertage"].map((day, i) => (
                  <div key={day} className="p-4 rounded-lg bg-muted/50">
                    <p className="font-medium text-foreground mb-2">{day}</p>
                    <p className="text-sm text-muted-foreground">
                      {i === 0 ? "08:00 - 18:00" : i === 1 ? "09:00 - 14:00" : "Nicht verfügbar"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {currentMonth.toLocaleString("de-DE", { month: "long", year: "numeric" })}
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days - Added onClick handler */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((day, index) => (
                  <div
                    key={index}
                    onClick={() => handleDayClick(day)}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-all cursor-pointer ${
                      day === null
                        ? ""
                        : vacationDaysState.includes(day)
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                          : bookedDays.includes(day)
                            ? "bg-primary/20 text-primary font-medium hover:bg-primary/30"
                            : "hover:bg-muted"
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary/20" />
                  <span className="text-muted-foreground">Gebuchte Termine</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/30" />
                  <span className="text-muted-foreground">Urlaub</span>
                </div>
              </div>
            </div>

            {/* Vacation Planning */}
            <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 text-primary" />
                Urlaub planen
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Von</label>
                  <input
                    type="date"
                    value={vacationStart}
                    onChange={(e) => setVacationStart(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background dark:bg-[#0f1512]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Bis</label>
                  <input
                    type="date"
                    value={vacationEnd}
                    onChange={(e) => setVacationEnd(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background dark:bg-[#0f1512]"
                  />
                </div>
                <Button
                  className="sm:self-end bg-primary hover:bg-primary/90"
                  onClick={handleAddVacation}
                  disabled={!vacationStart || !vacationEnd}
                >
                  Urlaub eintragen
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showDayDialog} onOpenChange={setShowDayDialog}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle>
              {selectedDay}. {currentMonth.toLocaleString("de-DE", { month: "long", year: "numeric" })}
            </DialogTitle>
            <DialogDescription>
              {vacationDaysState.includes(selectedDay || 0)
                ? "Urlaub"
                : bookedDays.includes(selectedDay || 0)
                  ? "Gebuchte Termine"
                  : "Keine Termine"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {vacationDaysState.includes(selectedDay || 0) ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-blue-500" />
                  <span>Urlaub eingetragen</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 hover:text-red-600 bg-transparent"
                  onClick={() => {
                    handleRemoveVacation(selectedDay!)
                    setShowDayDialog(false)
                  }}
                >
                  Entfernen
                </Button>
              </div>
            ) : (
              <>
                {appointments[selectedDay || 0]?.map((apt, idx) => (
                  <div key={idx} className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{apt.title}</span>
                      <span className="text-sm text-muted-foreground">{apt.time} Uhr</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{apt.customer}</p>
                      <p>{apt.address}</p>
                    </div>
                  </div>
                )) || <p className="text-muted-foreground text-center py-4">Keine Termine an diesem Tag</p>}
                <Button
                  className="w-full gap-2 bg-primary hover:bg-primary/90"
                  onClick={() => setShowAddAppointment(true)}
                >
                  <Plus className="w-4 h-4" />
                  Termin hinzufugen
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddAppointment} onOpenChange={setShowAddAppointment}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle>Neuen Termin hinzufugen</DialogTitle>
            <DialogDescription>
              Termin fur den {selectedDay}. {currentMonth.toLocaleString("de-DE", { month: "long" })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Titel *</Label>
              <Input
                placeholder="z.B. Lampe installieren"
                className="bg-background dark:bg-[#0f1512]"
                value={newAppointment.title}
                onChange={(e) => setNewAppointment((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Uhrzeit *</Label>
              <Input
                type="time"
                className="bg-background dark:bg-[#0f1512]"
                value={newAppointment.time}
                onChange={(e) => setNewAppointment((prev) => ({ ...prev, time: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Kunde</Label>
              <Input
                placeholder="Name des Kunden"
                className="bg-background dark:bg-[#0f1512]"
                value={newAppointment.customer}
                onChange={(e) => setNewAppointment((prev) => ({ ...prev, customer: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                placeholder="Adresse"
                className="bg-background dark:bg-[#0f1512]"
                value={newAppointment.address}
                onChange={(e) => setNewAppointment((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAddAppointment(false)}>
              Abbrechen
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleAddAppointment}>
              Hinzufugen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle>Nachricht an {selectedOrder?.customer}</DialogTitle>
            <DialogDescription>Senden Sie eine Nachricht zum Auftrag #{selectedOrder?.id}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea // Changed from textarea to Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Ihre Nachricht..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-[#0f1512] focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px]"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowMessageDialog(false)}>
              Abbrechen
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              Senden
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle>Rechnung erstellen</DialogTitle>
            <DialogDescription>Erstellen Sie eine Rechnung für Auftrag #{selectedOrder?.id}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium text-foreground">{selectedOrder?.description}</p>
              <p className="text-sm text-muted-foreground mt-1">Kunde: {selectedOrder?.customer}</p>
              <p className="text-lg font-bold text-primary mt-2">Betrag: €{selectedOrder?.price}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1 block">Zusätzliche Anmerkungen</Label>
              <Textarea // Changed from textarea to Textarea
                placeholder="Optionale Anmerkungen zur Rechnung..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-[#0f1512] focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowInvoiceDialog(false)}>
              Abbrechen
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleCreateInvoice}>
              <FileText className="w-4 h-4 mr-2" />
              Rechnung erstellen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPhotoUpload} onOpenChange={setShowPhotoUpload}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle>Foto hinzufügen</DialogTitle>
            <DialogDescription>Laden Sie Vorher/Nachher Fotos Ihrer Arbeit hoch</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-1 block">Projekttitel</Label>
              <Input
                type="text"
                placeholder="z.B. Badezimmer Renovierung"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-[#0f1512] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-1 block">Vorher</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Foto hochladen</p>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1 block">Nachher</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Foto hochladen</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowPhotoUpload(false)}>
              Abbrechen
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => {
                setShowPhotoUpload(false)
                alert("Fotos wurden hochgeladen!")
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Hochladen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCertUpload} onOpenChange={setShowCertUpload}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle>Zertifikat hochladen</DialogTitle>
            <DialogDescription>Laden Sie Ihre Qualifikationsnachweise hoch</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-1 block">Zertifikatname</Label>
              <Input
                type="text"
                placeholder="z.B. Elektrofachkraft"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-[#0f1512] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1 block">Aussteller</Label>
              <Input
                type="text"
                placeholder="z.B. IHK Berlin"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-[#0f1512] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1 block">Dokument</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">PDF oder Bild hochladen</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowCertUpload(false)}>
              Abbrechen
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => {
                setShowCertUpload(false)
                alert("Zertifikat wurde hochgeladen!")
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Hochladen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
