"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Shield, LogOut, BarChart3, Users, FileText, PieChart, Settings, RefreshCw } from "lucide-react"

type TabType = "uebersicht" | "benutzer" | "auftraege" | "statistiken" | "einstellungen"

// User and Order interfaces for API data
interface UserData {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  user_type: "client" | "master"
  status: string
  registered_at: string
  last_active: string
  verified: boolean
  orders_count: number
  rating?: number
  name: string // computed field
}

interface OrderData {
  id: number
  title: string
  customer: string
  handwerker: string
  status: string
  date: string
  category?: string
  address?: string
  price?: number
}

interface StatsData {
  total_users: number
  active_clients: number
  active_masters: number
  blocked_users: number
  total_orders: number
  open_orders: number
  completed_orders: number
  total_revenue: number
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("uebersicht")
  const router = useRouter()

  // API data states
  const [users, setUsers] = useState<UserData[]>([])
  const [orders, setOrders] = useState<OrderData[]>([])
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load users
      try {
        const usersResponse = await fetch('/api/admin/users')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setUsers(usersData.data || [])
        }
      } catch (err) {
        console.error('Users fetch error:', err)
      }

      // Load orders
      try {
        const ordersResponse = await fetch('/api/admin/orders')
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          setOrders(ordersData.data || [])
        }
      } catch (err) {
        console.error('Orders fetch error:', err)
      }

      // Load stats
      try {
        const statsResponse = await fetch('/api/admin/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData.data)
        }
      } catch (err) {
        console.error('Stats fetch error:', err)
      }

    } catch (err) {
      setError('Fehler beim Laden der Daten')
      console.error('Data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

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
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Daten werden geladen...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Fehler beim Laden</h3>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={fetchData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Neu laden
              </Button>
            </div>
          </div>
        )}

        {/* Success State - Show Real Data */}
        {!loading && !error && (
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
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
              </div>

              <div className="bg-card dark:bg-[#1a2420] p-6 rounded-xl border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-muted-foreground text-sm">Aufträge gesamt</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{orders.length}</p>
              </div>

              {stats && (
                <>
                  <div className="bg-card dark:bg-[#1a2420] p-6 rounded-xl border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-muted-foreground text-sm">Aktive Kunden</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stats.active_clients || 0}</p>
                  </div>

                  <div className="bg-card dark:bg-[#1a2420] p-6 rounded-xl border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span className="text-muted-foreground text-sm">Offene Aufträge</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stats.open_orders || 0}</p>
                  </div>
                </>
              )}
            </div>

            {/* Content based on active tab */}
            {activeTab === "uebersicht" && (
              <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Übersicht</h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Willkommen im Admin Dashboard von AssetCare24!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Benutzer</h4>
                      <p className="text-sm text-muted-foreground">
                        {users.length} Benutzer registriert
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Aufträge</h4>
                      <p className="text-sm text-muted-foreground">
                        {orders.length} Aufträge im System
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "benutzer" && (
              <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Benutzer</h3>
                {users.length > 0 ? (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email || 'Keine E-Mail'} • {user.orders_count} Aufträge
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'aktiv' ? 'bg-green-100 text-green-800' :
                            user.status === 'gesperrt' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.user_type === 'client' ? 'Kunde' : 'Handwerker'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Keine Benutzer gefunden</p>
                )}
              </div>
            )}

            {activeTab === "auftraege" && (
              <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Aufträge</h3>
                {orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{order.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.customer} • {order.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'offen' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'zugewiesen' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'in_bearbeitung' ? 'bg-orange-100 text-orange-800' :
                            order.status === 'abgeschlossen' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Keine Aufträge gefunden</p>
                )}
              </div>
            )}

            {activeTab === "statistiken" && (
              <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Statistiken</h3>
                {stats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{stats.total_users}</p>
                      <p className="text-sm text-muted-foreground">Gesamt Benutzer</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{stats.active_clients}</p>
                      <p className="text-sm text-muted-foreground">Aktive Kunden</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{stats.total_orders}</p>
                      <p className="text-sm text-muted-foreground">Gesamt Aufträge</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{stats.open_orders}</p>
                      <p className="text-sm text-muted-foreground">Offene Aufträge</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Keine Statistiken verfügbar</p>
                )}
              </div>
            )}

            {activeTab === "einstellungen" && (
              <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Einstellungen</h3>
                <p className="text-muted-foreground">Einstellungen werden bald verfügbar sein.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
