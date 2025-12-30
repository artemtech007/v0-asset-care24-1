"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  Users,
  Wrench,
  Building2,
  FileText,
  BarChart3,
  Settings,
  Bell,
  Shield,
  Search,
  Eye,
  Ban,
  CheckCircle2,
  TrendingUp,
  Euro,
  AlertTriangle,
  MessageSquare,
  Star,
  LogOut,
  UserPlus,
  PieChart,
  Mail,
  Download,
  RefreshCw,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type TabType = "uebersicht" | "benutzer" | "auftraege" | "statistiken" | "einstellungen"
type UserFilter = "alle" | "kunden" | "handwerker" | "firmen"
type StatusFilter = "alle" | "aktiv" | "inaktiv" | "gesperrt"

interface UserData {
  id: number
  name: string
  email: string
  phone: string
  type: "kunde" | "handwerker" | "firma"
  status: "aktiv" | "inaktiv" | "gesperrt"
  registeredDate: string
  lastActive: string
  verified: boolean
  ordersCount: number
  rating?: number
}

interface OrderData {
  id: number
  title: string
  customer: string
  handwerker: string | null
  status: "offen" | "zugewiesen" | "in_bearbeitung" | "abgeschlossen" | "storniert"
  date: string
  category: string
  address: string
  price?: number
}

const initialUsers: UserData[] = [
  {
    id: 1,
    name: "Anna Müller",
    email: "anna@example.de",
    phone: "+49 151 1234567",
    type: "kunde",
    status: "aktiv",
    registeredDate: "01.10.2025",
    lastActive: "12.12.2025",
    verified: true,
    ordersCount: 8,
  },
  {
    id: 2,
    name: "Thomas Schmidt",
    email: "thomas@example.de",
    phone: "+49 152 2345678",
    type: "handwerker",
    status: "aktiv",
    registeredDate: "15.09.2025",
    lastActive: "12.12.2025",
    verified: true,
    ordersCount: 45,
    rating: 4.8,
  },
  {
    id: 3,
    name: "Müller GmbH",
    email: "info@mueller-gmbh.de",
    phone: "+49 30 1234567",
    type: "firma",
    status: "aktiv",
    registeredDate: "01.08.2025",
    lastActive: "11.12.2025",
    verified: true,
    ordersCount: 120,
    rating: 4.6,
  },
  {
    id: 4,
    name: "Peter Weber",
    email: "peter@example.de",
    phone: "+49 153 3456789",
    type: "kunde",
    status: "inaktiv",
    registeredDate: "20.11.2025",
    lastActive: "25.11.2025",
    verified: false,
    ordersCount: 1,
  },
  {
    id: 5,
    name: "Maria Fischer",
    email: "maria@example.de",
    phone: "+49 154 4567890",
    type: "handwerker",
    status: "gesperrt",
    registeredDate: "05.07.2025",
    lastActive: "01.12.2025",
    verified: true,
    ordersCount: 12,
    rating: 2.1,
  },
  {
    id: 6,
    name: "Klaus Bauer",
    email: "klaus@example.de",
    phone: "+49 155 5678901",
    type: "kunde",
    status: "aktiv",
    registeredDate: "10.12.2025",
    lastActive: "12.12.2025",
    verified: true,
    ordersCount: 3,
  },
]

const initialOrders: OrderData[] = [
  {
    id: 1001,
    title: "Heizung reparieren",
    customer: "Anna Müller",
    handwerker: "Thomas Schmidt",
    status: "in_bearbeitung",
    date: "10.12.2025",
    category: "Sanitär",
    address: "Berlin",
    price: 350,
  },
  {
    id: 1002,
    title: "Fenster austauschen",
    customer: "Klaus Bauer",
    handwerker: null,
    status: "offen",
    date: "11.12.2025",
    category: "Tischler",
    address: "München",
  },
  {
    id: 1003,
    title: "Elektrik überprüfen",
    customer: "Anna Müller",
    handwerker: "Müller GmbH",
    status: "abgeschlossen",
    date: "05.12.2025",
    category: "Elektrik",
    address: "Berlin",
    price: 180,
  },
  {
    id: 1004,
    title: "Gartenpflege",
    customer: "Peter Weber",
    handwerker: "Thomas Schmidt",
    status: "zugewiesen",
    date: "12.12.2025",
    category: "Garten",
    address: "Hamburg",
    price: 200,
  },
  {
    id: 1005,
    title: "Malerarbeiten",
    customer: "Klaus Bauer",
    handwerker: null,
    status: "storniert",
    date: "08.12.2025",
    category: "Maler",
    address: "München",
  },
]

export function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("uebersicht")
  const [users, setUsers] = useState<UserData[]>(initialUsers)
  const [orders, setOrders] = useState<OrderData[]>(initialOrders)
  const [userFilter, setUserFilter] = useState<UserFilter>("alle")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("alle")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)

  // Statistics
  const totalUsers = users.length
  const totalKunden = users.filter((u) => u.type === "kunde").length
  const totalHandwerker = users.filter((u) => u.type === "handwerker").length
  const totalFirmen = users.filter((u) => u.type === "firma").length
  const activeUsers = users.filter((u) => u.status === "aktiv").length
  const blockedUsers = users.filter((u) => u.status === "gesperrt").length
  const totalOrders = orders.length
  const openOrders = orders.filter((o) => o.status === "offen").length
  const completedOrders = orders.filter((o) => o.status === "abgeschlossen").length
  const totalRevenue = orders.filter((o) => o.price).reduce((sum, o) => sum + (o.price || 0), 0)

  const filteredUsers = users.filter((user) => {
    const matchesType =
      userFilter === "alle" ||
      (userFilter === "kunden" && user.type === "kunde") ||
      (userFilter === "handwerker" && user.type === "handwerker") ||
      (userFilter === "firmen" && user.type === "firma")
    const matchesStatus = statusFilter === "alle" || user.status === statusFilter
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesStatus && matchesSearch
  })

  const handleBlockUser = (user: UserData) => {
    setSelectedUser(user)
    setShowBlockDialog(true)
  }

  const confirmBlockUser = () => {
    if (selectedUser) {
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, status: u.status === "gesperrt" ? "aktiv" : "gesperrt" } : u,
        ),
      )
      setShowBlockDialog(false)
      setSelectedUser(null)
    }
  }

  const handleLogout = () => {
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aktiv":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "inaktiv":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      case "gesperrt":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "offen":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "zugewiesen":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "in_bearbeitung":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "abgeschlossen":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "storniert":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "kunde":
        return <Users className="w-4 h-4" />
      case "handwerker":
        return <Wrench className="w-4 h-4" />
      case "firma":
        return <Building2 className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const tabs = [
    { id: "uebersicht", label: "Übersicht", icon: BarChart3 },
    { id: "benutzer", label: "Benutzer", icon: Users },
    { id: "auftraege", label: "Aufträge", icon: FileText },
    { id: "statistiken", label: "Statistiken", icon: PieChart },
    { id: "einstellungen", label: "Einstellungen", icon: Settings },
  ]

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
              >
                <Bell className="w-4 h-4 mr-2" />
                <span className="bg-accent text-white text-xs px-1.5 py-0.5 rounded-full">5</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                onClick={handleLogout}
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
            {tabs.map((tab) => (
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
        {/* Overview Tab */}
        {activeTab === "uebersicht" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card dark:bg-[#1a2420] p-6 rounded-xl border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-muted-foreground text-sm">Benutzer gesamt</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{totalUsers}</p>
                <p className="text-sm text-muted-foreground mt-1">{activeUsers} aktiv</p>
              </div>

              <div className="bg-card dark:bg-[#1a2420] p-6 rounded-xl border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-muted-foreground text-sm">Aufträge gesamt</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{totalOrders}</p>
                <p className="text-sm text-muted-foreground mt-1">{openOrders} offen</p>
              </div>

              <div className="bg-card dark:bg-[#1a2420] p-6 rounded-xl border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <Euro className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="text-muted-foreground text-sm">Umsatz (Monat)</span>
                </div>
                <p className="text-3xl font-bold text-foreground">€{totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12% vs. Vormonat
                </p>
              </div>

              <div className="bg-card dark:bg-[#1a2420] p-6 rounded-xl border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-muted-foreground text-sm">Gesperrte Benutzer</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{blockedUsers}</p>
                <p className="text-sm text-muted-foreground mt-1">Überprüfung erforderlich</p>
              </div>
            </div>

            {/* User Distribution */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card dark:bg-[#1a2420] p-6 rounded-xl border border-border">
                <h3 className="font-semibold text-foreground mb-4">Benutzerverteilung</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-foreground">Kunden</span>
                    </div>
                    <span className="font-semibold text-foreground">{totalKunden}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(totalKunden / totalUsers) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-foreground">Handwerker</span>
                    </div>
                    <span className="font-semibold text-foreground">{totalHandwerker}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(totalHandwerker / totalUsers) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-foreground">Firmen</span>
                    </div>
                    <span className="font-semibold text-foreground">{totalFirmen}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(totalFirmen / totalUsers) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card dark:bg-[#1a2420] p-6 rounded-xl border border-border">
                <h3 className="font-semibold text-foreground mb-4">Letzte Aktivitäten</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 dark:bg-[#0f1512] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">Neuer Benutzer registriert</p>
                      <p className="text-xs text-muted-foreground">Klaus Bauer - vor 2 Stunden</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 dark:bg-[#0f1512] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">Neuer Auftrag erstellt</p>
                      <p className="text-xs text-muted-foreground">Fenster austauschen - vor 3 Stunden</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 dark:bg-[#0f1512] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">Neue Bewertung erhalten</p>
                      <p className="text-xs text-muted-foreground">Thomas Schmidt - 5 Sterne - vor 5 Stunden</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 dark:bg-[#0f1512] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">Benutzer gemeldet</p>
                      <p className="text-xs text-muted-foreground">Maria Fischer - vor 1 Tag</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card dark:bg-[#1a2420] p-6 rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-4">Schnellaktionen</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2 bg-transparent"
                  onClick={() => setActiveTab("benutzer")}
                >
                  <Users className="w-5 h-5 text-primary" />
                  <span>Benutzer verwalten</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2 bg-transparent"
                  onClick={() => setActiveTab("auftraege")}
                >
                  <FileText className="w-5 h-5 text-primary" />
                  <span>Aufträge anzeigen</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-transparent">
                  <Download className="w-5 h-5 text-primary" />
                  <span>Bericht exportieren</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-transparent">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>Nachricht senden</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "benutzer" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-card dark:bg-[#1a2420] p-4 rounded-xl border border-border">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Benutzer suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background dark:bg-[#0f1512] text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value as UserFilter)}
                    className="px-4 py-2 rounded-lg border border-border bg-background dark:bg-[#0f1512] text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="alle">Alle Typen</option>
                    <option value="kunden">Kunden</option>
                    <option value="handwerker">Handwerker</option>
                    <option value="firmen">Firmen</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="px-4 py-2 rounded-lg border border-border bg-background dark:bg-[#0f1512] text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="alle">Alle Status</option>
                    <option value="aktiv">Aktiv</option>
                    <option value="inaktiv">Inaktiv</option>
                    <option value="gesperrt">Gesperrt</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 dark:bg-[#0f1512]">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Benutzer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Typ</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Registriert</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Aufträge</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/30 dark:hover:bg-[#0f1512]/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {getTypeIcon(user.type)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground flex items-center gap-2">
                                {user.name}
                                {user.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                              </p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="capitalize text-foreground">{user.type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{user.registeredDate}</td>
                        <td className="px-4 py-3 text-foreground">{user.ordersCount}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setShowUserDialog(true)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleBlockUser(user)}
                              className={user.status === "gesperrt" ? "text-green-600" : "text-red-600"}
                            >
                              {user.status === "gesperrt" ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "auftraege" && (
          <div className="space-y-6">
            {/* Orders Table */}
            <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Alle Aufträge</h3>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Aktualisieren
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 dark:bg-[#0f1512]">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Auftrag</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Kunde</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Handwerker</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Datum</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 dark:hover:bg-[#0f1512]/50">
                        <td className="px-4 py-3 text-muted-foreground">#{order.id}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-foreground">{order.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.category} • {order.address}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-foreground">{order.customer}</td>
                        <td className="px-4 py-3 text-foreground">{order.handwerker || "-"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                          >
                            {order.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{order.date}</td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowOrderDialog(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "statistiken" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card dark:bg-[#1a2420] p-6 rounded-xl border border-border">
                <h3 className="font-semibold text-foreground mb-4">Auftragsstatistik</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Offen</span>
                    <span className="font-semibold text-foreground">{openOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">In Bearbeitung</span>
                    <span className="font-semibold text-foreground">
                      {orders.filter((o) => o.status === "in_bearbeitung").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Abgeschlossen</span>
                    <span className="font-semibold text-foreground">{completedOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Storniert</span>
                    <span className="font-semibold text-foreground">
                      {orders.filter((o) => o.status === "storniert").length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-card dark:bg-[#1a2420] p-6 rounded-xl border border-border">
                <h3 className="font-semibold text-foreground mb-4">Umsatzentwicklung</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Dieser Monat</span>
                    <span className="font-semibold text-foreground">€{totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Letzter Monat</span>
                    <span className="font-semibold text-foreground">
                      €{Math.round(totalRevenue * 0.88).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Durchschnitt/Auftrag</span>
                    <span className="font-semibold text-foreground">€{Math.round(totalRevenue / completedOrders)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Wachstum</span>
                    <span className="font-semibold text-green-600">+12%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card dark:bg-[#1a2420] p-6 rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-4">Top Kategorien</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Sanitär", "Elektrik", "Garten", "Maler"].map((category) => (
                  <div key={category} className="p-4 bg-muted/50 dark:bg-[#0f1512] rounded-lg text-center">
                    <p className="font-semibold text-foreground">{category}</p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {orders.filter((o) => o.category === category).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Aufträge</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "einstellungen" && (
          <div className="space-y-6">
            <div className="bg-card dark:bg-[#1a2420] p-6 rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-4">Systemeinstellungen</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 dark:bg-[#0f1512] rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">E-Mail-Benachrichtigungen</p>
                    <p className="text-sm text-muted-foreground">
                      Erhalte Benachrichtigungen bei neuen Registrierungen
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 dark:bg-[#0f1512] rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Automatische Moderation</p>
                    <p className="text-sm text-muted-foreground">Neue Benutzer automatisch prüfen</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 dark:bg-[#0f1512] rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Wartungsmodus</p>
                    <p className="text-sm text-muted-foreground">Plattform für Wartungsarbeiten sperren</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-primary" />
                </div>
              </div>
            </div>

            <div className="bg-card dark:bg-[#1a2420] p-6 rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-4">Admin-Konto</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Admin-E-Mail</label>
                  <input
                    type="email"
                    defaultValue="admin@assetcare24.de"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background dark:bg-[#0f1512] text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Passwort ändern</label>
                  <input
                    type="password"
                    placeholder="Neues Passwort eingeben"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background dark:bg-[#0f1512] text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <Button className="bg-primary text-white">Änderungen speichern</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Benutzerdetails</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {getTypeIcon(selectedUser.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{selectedUser.name}</h3>
                  <p className="text-muted-foreground capitalize">{selectedUser.type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">E-Mail</p>
                  <p className="text-foreground">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="text-foreground">{selectedUser.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registriert</p>
                  <p className="text-foreground">{selectedUser.registeredDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zuletzt aktiv</p>
                  <p className="text-foreground">{selectedUser.lastActive}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                    {selectedUser.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verifiziert</p>
                  <p className="text-foreground">{selectedUser.verified ? "Ja" : "Nein"}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Nachricht
                </Button>
                <Button
                  variant={selectedUser.status === "gesperrt" ? "default" : "destructive"}
                  className="flex-1"
                  onClick={() => {
                    setShowUserDialog(false)
                    handleBlockUser(selectedUser)
                  }}
                >
                  {selectedUser.status === "gesperrt" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Entsperren
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4 mr-2" />
                      Sperren
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Auftragsdetails</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground text-lg">{selectedOrder.title}</h3>
                <p className="text-muted-foreground">#{selectedOrder.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Kunde</p>
                  <p className="text-foreground">{selectedOrder.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Handwerker</p>
                  <p className="text-foreground">{selectedOrder.handwerker || "Nicht zugewiesen"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kategorie</p>
                  <p className="text-foreground">{selectedOrder.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="text-foreground">{selectedOrder.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Datum</p>
                  <p className="text-foreground">{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Preis</p>
                  <p className="text-foreground">
                    {selectedOrder.price ? `€${selectedOrder.price}` : "Nicht festgelegt"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status.replace("_", " ")}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Block User Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {selectedUser?.status === "gesperrt" ? "Benutzer entsperren" : "Benutzer sperren"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedUser?.status === "gesperrt"
                ? `Möchten Sie ${selectedUser?.name} wirklich entsperren?`
                : `Möchten Sie ${selectedUser?.name} wirklich sperren? Der Benutzer kann sich nicht mehr anmelden.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowBlockDialog(false)}>
              Abbrechen
            </Button>
            <Button
              variant={selectedUser?.status === "gesperrt" ? "default" : "destructive"}
              className="flex-1"
              onClick={confirmBlockUser}
            >
              {selectedUser?.status === "gesperrt" ? "Entsperren" : "Sperren"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
