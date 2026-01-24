"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Shield, LogOut, BarChart3, Users, FileText, PieChart, Settings, RefreshCw, Search, MoreVertical, Edit } from "lucide-react"

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
  ordersCount: number
  rating?: number
  name: string // computed field
}

interface OrderData {
  id: number
  client_id?: string
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

  // Filter states
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'client' | 'master'>('all')
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'inactive' | 'blocked'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Order filter states
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'new' | 'assigned' | 'in_progress' | 'completed' | 'canceled'>('all')
  const [orderUrgencyFilter, setOrderUrgencyFilter] = useState<'all' | 'low' | 'normal' | 'high' | 'urgent'>('all')

  // Status change modal states
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedUserForStatus, setSelectedUserForStatus] = useState<UserData | null>(null)
  const [statusChanging, setStatusChanging] = useState(false)

  // Order candidates modal states
  const [showCandidatesModal, setShowCandidatesModal] = useState(false)
  const [selectedOrderForCandidates, setSelectedOrderForCandidates] = useState<OrderData | null>(null)
  const [orderCandidates, setOrderCandidates] = useState<any[]>([])
  const [loadingCandidates, setLoadingCandidates] = useState(false)
  const [assigningMaster, setAssigningMaster] = useState(false)

  // Filtered data
  const filteredUsers = users.filter((user) => {
    const matchesType = userTypeFilter === 'all' ||
      (userTypeFilter === 'client' && user.user_type === 'client') ||
      (userTypeFilter === 'master' && user.user_type === 'master')

    const matchesStatus = userStatusFilter === 'all' ||
      (userStatusFilter === 'active' && user.status === 'aktiv') ||
      (userStatusFilter === 'inactive' && user.status === 'inaktiv') ||
      (userStatusFilter === 'blocked' && user.status === 'gesperrt')

    const matchesSearch = !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.phone && user.phone.includes(searchQuery))

    return matchesType && matchesStatus && matchesSearch
  })

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = orderStatusFilter === 'all' ||
      (orderStatusFilter === 'new' && order.status === 'offen') ||
      (orderStatusFilter === 'assigned' && order.status === 'zugewiesen') ||
      (orderStatusFilter === 'in_progress' && order.status === 'in_bearbeitung') ||
      (orderStatusFilter === 'completed' && order.status === 'abgeschlossen') ||
      (orderStatusFilter === 'canceled' && order.status === 'storniert')

    const matchesUrgency = orderUrgencyFilter === 'all' ||
      (orderUrgencyFilter === 'low' && order.urgency === 'low') ||
      (orderUrgencyFilter === 'normal' && order.urgency === 'normal') ||
      (orderUrgencyFilter === 'high' && order.urgency === 'high') ||
      (orderUrgencyFilter === 'urgent' && order.urgency === 'urgent')

    return matchesStatus && matchesUrgency
  })

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

  // Function to change user status
  const handleStatusChange = async (user: UserData, newStatus: 'active' | 'inactive' | 'blocked') => {
    try {
      setStatusChanging(true)

      const response = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update user status')
      }

      // Update local state optimistically
      setUsers(users.map(u =>
        u.id === user.id
          ? { ...u, status: newStatus === 'active' ? 'aktiv' : newStatus === 'inactive' ? 'inaktiv' : 'gesperrt' }
          : u
      ))

      setShowStatusModal(false)
      setSelectedUserForStatus(null)

      // Show success message (you can add toast notification here)
      console.log('Status updated successfully')

    } catch (error) {
      console.error('Status change error:', error)
      setError('Fehler beim Ändern des Status')
    } finally {
      setStatusChanging(false)
    }
  }

  // Function to load candidates for an order
  const loadOrderCandidates = async (order: OrderData) => {
    try {
      setLoadingCandidates(true)

      // Get client_id from requests table
      let clientId = 'unknown'
      try {
        const clientResponse = await fetch('/api/admin/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get_client_id',
            request_id: order.id
          })
        })
        if (clientResponse.ok) {
          const clientData = await clientResponse.json()
          clientId = clientData.data?.client_id || 'unknown'
        }
      } catch (clientError) {
        console.error('Failed to get client_id:', clientError)
      }

      const fullOrder = { ...order, client_id: clientId }

      const response = await fetch(`/api/admin/orders/${order.id}/candidates`)

      if (!response.ok) {
        throw new Error('Failed to load candidates')
      }

      const data = await response.json()
      setOrderCandidates(data.data || [])
      setSelectedOrderForCandidates(fullOrder)
      setShowCandidatesModal(true)

    } catch (error) {
      console.error('Load candidates error:', error)
      setError('Fehler beim Laden der Kandidaten')
    } finally {
      setLoadingCandidates(false)
    }
  }

  // Function to assign master from candidates
  const assignMasterFromCandidates = async (masterId: string, adminComment: string = '') => {
    if (!selectedOrderForCandidates) return

    try {
      setAssigningMaster(true)

      const response = await fetch(`/api/admin/orders/${selectedOrderForCandidates.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          master_id: masterId,
          admin_comment: adminComment
        })
      })

      if (!response.ok) {
        throw new Error('Failed to assign master')
      }

      // Webhooks are sent from the server-side API

      // Update local state
      setOrders(orders.map(order =>
        order.id === selectedOrderForCandidates.id
          ? { ...order, status: 'zugewiesen', detailed_status: 'master_assigned' }
          : order
      ))

      setShowCandidatesModal(false)
      setSelectedOrderForCandidates(null)
      setOrderCandidates([])

    } catch (error) {
      console.error('Assign master error:', error)
      setError('Fehler beim Zuweisen des Meisters')
    } finally {
      setAssigningMaster(false)
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

                {/* Filters and Search */}
                <div className="bg-card dark:bg-[#1a2420] p-4 rounded-xl border border-border mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Benutzer suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background dark:bg-[#0f1512] text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Type Filter */}
                    <div className="flex gap-2">
                      <select
                        value={userTypeFilter}
                        onChange={(e) => setUserTypeFilter(e.target.value as 'all' | 'client' | 'master')}
                        className="px-4 py-2 rounded-lg border border-border bg-background dark:bg-[#0f1512] text-foreground focus:outline-none focus:border-primary"
                      >
                        <option value="all">Alle Typen</option>
                        <option value="client">Kunden</option>
                        <option value="master">Handwerker</option>
                      </select>

                      {/* Status Filter */}
                      <select
                        value={userStatusFilter}
                        onChange={(e) => setUserStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'blocked')}
                        className="px-4 py-2 rounded-lg border border-border bg-background dark:bg-[#0f1512] text-foreground focus:outline-none focus:border-primary"
                      >
                        <option value="all">Alle Status</option>
                        <option value="active">Aktiv</option>
                        <option value="inactive">Inaktiv</option>
                        <option value="blocked">Gesperrt</option>
                      </select>
                    </div>
                  </div>
                </div>

                {filteredUsers.length > 0 ? (
                  <div className="space-y-3">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email || 'Keine E-Mail'} • {user.ordersCount} Aufträge
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
                          <button
                            onClick={() => {
                              setSelectedUserForStatus(user)
                              setShowStatusModal(true)
                            }}
                            className="p-1 hover:bg-muted/50 rounded transition-colors"
                            title="Status ändern"
                          >
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">
                      {searchQuery || userTypeFilter !== 'all' || userStatusFilter !== 'all'
                        ? 'Keine Benutzer entsprechen den Filterkriterien'
                        : 'Keine Benutzer gefunden'
                      }
                    </p>
                    {(searchQuery || userTypeFilter !== 'all' || userStatusFilter !== 'all') && (
                      <p className="text-sm text-muted-foreground">
                        {filteredUsers.length} von {users.length} Benutzern angezeigt
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "auftraege" && (
              <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Aufträge</h3>

                {/* Order Filters */}
                <div className="bg-card dark:bg-[#1a2420] p-4 rounded-xl border border-border mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex gap-2">
                      {/* Status Filter */}
                      <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value as 'all' | 'new' | 'assigned' | 'in_progress' | 'completed' | 'canceled')}
                        className="px-4 py-2 rounded-lg border border-border bg-background dark:bg-[#0f1512] text-foreground focus:outline-none focus:border-primary"
                      >
                        <option value="all">Alle Status</option>
                        <option value="new">Offen</option>
                        <option value="assigned">Zugewiesen</option>
                        <option value="in_progress">In Bearbeitung</option>
                        <option value="completed">Abgeschlossen</option>
                        <option value="canceled">Storniert</option>
                      </select>

                      {/* Urgency Filter */}
                      <select
                        value={orderUrgencyFilter}
                        onChange={(e) => setOrderUrgencyFilter(e.target.value as 'all' | 'low' | 'normal' | 'high' | 'urgent')}
                        className="px-4 py-2 rounded-lg border border-border bg-background dark:bg-[#0f1512] text-foreground focus:outline-none focus:border-primary"
                      >
                        <option value="all">Alle Prioritäten</option>
                        <option value="low">Niedrig</option>
                        <option value="normal">Normal</option>
                        <option value="high">Hoch</option>
                        <option value="urgent">Dringend</option>
                      </select>
                    </div>
                  </div>
                </div>

                {filteredOrders.length > 0 ? (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{order.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.customer} • {order.date}
                            {order.candidates_count && order.candidates_count > 0 && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {order.candidates_count} Kandidaten
                              </span>
                            )}
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
                          {(order.detailed_status === 'waiting_candidates' ||
                            order.detailed_status === 'candidates_collecting' ||
                            order.detailed_status === 'master_selection') && (
                            <button
                              onClick={() => loadOrderCandidates(order)}
                              disabled={loadingCandidates}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 transition-colors"
                            >
                              {loadingCandidates ? '...' : 'Kandidaten'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">
                      {orderStatusFilter !== 'all' || orderUrgencyFilter !== 'all'
                        ? 'Keine Aufträge entsprechen den Filterkriterien'
                        : 'Keine Aufträge gefunden'
                      }
                    </p>
                    {(orderStatusFilter !== 'all' || orderUrgencyFilter !== 'all') && (
                      <p className="text-sm text-muted-foreground">
                        {filteredOrders.length} von {orders.length} Aufträgen angezeigt
                      </p>
                    )}
                  </div>
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

      {/* Status Change Modal */}
      {showStatusModal && selectedUserForStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Status ändern</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Benutzer:</p>
                <p className="font-medium text-foreground">{selectedUserForStatus.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedUserForStatus.email || 'Keine E-Mail'} • {selectedUserForStatus.user_type === 'client' ? 'Kunde' : 'Handwerker'}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Aktueller Status:</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedUserForStatus.status === 'aktiv' ? 'bg-green-100 text-green-800' :
                  selectedUserForStatus.status === 'gesperrt' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedUserForStatus.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Neuer Status:</p>
                <div className="space-y-2">
                  {[
                    { value: 'active', label: 'Aktiv', color: 'bg-green-100 text-green-800' },
                    { value: 'inactive', label: 'Inaktiv', color: 'bg-yellow-100 text-yellow-800' },
                    { value: 'blocked', label: 'Gesperrt', color: 'bg-red-100 text-red-800' }
                  ].map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusChange(selectedUserForStatus, status.value as 'active' | 'inactive' | 'blocked')}
                      disabled={statusChanging}
                      className={`w-full p-3 rounded-lg border text-left hover:bg-muted/50 transition-colors ${
                        status.value === (selectedUserForStatus.status === 'aktiv' ? 'active' :
                                         selectedUserForStatus.status === 'inaktiv' ? 'inactive' :
                                         selectedUserForStatus.status === 'gesperrt' ? 'blocked' : '')
                          ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                    >
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setSelectedUserForStatus(null)
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  disabled={statusChanging}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Candidates Modal */}
      {showCandidatesModal && selectedOrderForCandidates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card dark:bg-[#1a2420] rounded-xl border border-border p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Kandidaten für Auftrag #{selectedOrderForCandidates.id}
            </h3>
            <div className="space-y-4 mb-6">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-medium text-foreground">{selectedOrderForCandidates.title}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedOrderForCandidates.customer} • {selectedOrderForCandidates.category}
                </p>
              </div>
            </div>

            {orderCandidates.length > 0 ? (
              <div className="space-y-3">
                {orderCandidates.map((candidate: any) => (
                  <div key={candidate.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {candidate.masters?.first_name} {candidate.masters?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {candidate.masters?.phone} • {candidate.masters?.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Bewertung: {candidate.masters?.rating || 'N/A'} •
                            Abgeschlossene: {candidate.masters?.completed_jobs || 0} •
                            In Arbeit: {candidate.masters?.active_jobs || 0}
                          </p>
                          {candidate.master_comment && (
                            <p className="text-xs text-blue-600 mt-1">
                              "{candidate.master_comment}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {candidate.masters?.master_settings?.spec_elektrik && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Elektrik</span>
                        )}
                        {candidate.masters?.master_settings?.spec_sanitaer && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Sanitär</span>
                        )}
                        {candidate.masters?.master_settings?.spec_heizung && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Heizung</span>
                        )}
                        {candidate.masters?.master_settings?.spec_maler && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Maler</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        candidate.status === 'selected' ? 'bg-green-100 text-green-800' :
                        candidate.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {candidate.status === 'selected' ? 'Ausgewählt' :
                         candidate.status === 'rejected' ? 'Abgelehnt' :
                         'Ausstehend'}
                      </span>

                      {candidate.status === 'pending' && (
                        <button
                          onClick={() => assignMasterFromCandidates(candidate.masters?.id)}
                          disabled={assigningMaster}
                          className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 transition-colors"
                        >
                          {assigningMaster ? 'Zuweisen...' : 'Zuweisen'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Keine Kandidaten gefunden
              </p>
            )}

            <div className="flex gap-3 pt-6 border-t">
              <button
                onClick={() => {
                  setShowCandidatesModal(false)
                  setSelectedOrderForCandidates(null)
                  setOrderCandidates([])
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
