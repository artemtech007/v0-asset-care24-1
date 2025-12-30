"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  TrendingUp,
  Star,
  Calendar,
  Briefcase,
  Euro,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Car,
  Wrench,
  BarChart3,
  PieChart,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Building2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  FileText,
  LogOut,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { VerificationPopup } from "@/components/verification-popup"

interface Employee {
  id: number
  name: string
  role: string
  rating: number
  status: "available" | "busy" | "vacation"
  phone: string
  email: string
  ordersCompleted: number
  monthlyEarnings: number
}

interface TeamOrder {
  id: number
  title: string
  client: string
  address: string
  date: string
  assignedEmployees: string[]
  status: "planned" | "in-progress" | "completed"
  value: number
}

interface Resource {
  id: number
  name: string
  type: "vehicle" | "tool"
  status: "available" | "in-use" | "maintenance"
  assignedTo?: string
}

export function FirmaDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [showAddOrder, setShowAddOrder] = useState(false)
  const [expandedEmployee, setExpandedEmployee] = useState<number | null>(null)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showEditEmployee, setShowEditEmployee] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<TeamOrder | null>(null)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [showAddTool, setShowAddTool] = useState(false)
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null)
  const [showDayDialog, setShowDayDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)

  const [editFormData, setEditFormData] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
  })
  const [showEditOrder, setShowEditOrder] = useState(false)
  const [editOrderData, setEditOrderData] = useState({
    title: "",
    address: "",
    status: "",
  })

  const [showVerification, setShowVerification] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    const verified = localStorage.getItem("firma_verified")
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
    localStorage.setItem("firma_verified", "true")
  }

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: "Max Müller",
      role: "Elektriker",
      rating: 4.8,
      status: "available",
      phone: "+49 151 1234567",
      email: "max@firma.de",
      ordersCompleted: 156,
      monthlyEarnings: 3200,
    },
    {
      id: 2,
      name: "Anna Schmidt",
      role: "Reinigung",
      rating: 4.5,
      status: "busy",
      phone: "+49 152 2345678",
      email: "anna@firma.de",
      ordersCompleted: 89,
      monthlyEarnings: 2100,
    },
    {
      id: 3,
      name: "Thomas Bauer",
      role: "Gartenpflege",
      rating: 4.7,
      status: "available",
      phone: "+49 153 3456789",
      email: "thomas@firma.de",
      ordersCompleted: 124,
      monthlyEarnings: 2800,
    },
    {
      id: 4,
      name: "Lisa Weber",
      role: "Sanitär",
      rating: 4.9,
      status: "vacation",
      phone: "+49 154 4567890",
      email: "lisa@firma.de",
      ordersCompleted: 201,
      monthlyEarnings: 3500,
    },
    {
      id: 5,
      name: "Frank Klein",
      role: "Malerarbeiten",
      rating: 4.6,
      status: "available",
      phone: "+49 155 5678901",
      email: "frank@firma.de",
      ordersCompleted: 78,
      monthlyEarnings: 1900,
    },
  ])

  const [teamOrders, setTeamOrders] = useState<TeamOrder[]>([
    {
      id: 1,
      title: "Komplette Wohnungsrenovierung",
      client: "Familie Schneider",
      address: "Berliner Str. 45, Berlin",
      date: "2024-01-20",
      assignedEmployees: ["Max Müller", "Frank Klein", "Lisa Weber"],
      status: "in-progress",
      value: 4500,
    },
    {
      id: 2,
      title: "Bürogebäude Reinigung",
      client: "TechStart GmbH",
      address: "Industrieweg 12, Berlin",
      date: "2024-01-22",
      assignedEmployees: ["Anna Schmidt"],
      status: "planned",
      value: 800,
    },
    {
      id: 3,
      title: "Gartenneugestaltung",
      client: "Herr Hoffmann",
      address: "Gartenstr. 8, Potsdam",
      date: "2024-01-25",
      assignedEmployees: ["Thomas Bauer"],
      status: "planned",
      value: 2200,
    },
    {
      id: 4,
      title: "Elektroinstallation Neubau",
      client: "Bauträger Berlin AG",
      address: "Neubaustr. 100, Berlin",
      date: "2024-01-18",
      assignedEmployees: ["Max Müller"],
      status: "completed",
      value: 3800,
    },
  ])

  const [resources, setResources] = useState<Resource[]>([
    { id: 1, name: "Transporter VW", type: "vehicle", status: "in-use", assignedTo: "Max Müller" },
    { id: 2, name: "Kleinwagen Ford", type: "vehicle", status: "available" },
    { id: 3, name: "Sprinter Mercedes", type: "vehicle", status: "available" },
    { id: 4, name: "Bohrmaschinen-Set", type: "tool", status: "in-use", assignedTo: "Frank Klein" },
    { id: 5, name: "Hochdruckreiniger", type: "tool", status: "available" },
    { id: 6, name: "Rasenmäher-Set", type: "tool", status: "in-use", assignedTo: "Thomas Bauer" },
  ])

  const companyStats = {
    totalRevenue: 12500,
    totalOrders: 45,
    customerSatisfaction: 4.6,
    activeEmployees: employees.filter((e) => e.status !== "vacation").length,
    completedThisMonth: 38,
    pendingOrders: 7,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "busy":
        return "bg-yellow-500"
      case "vacation":
        return "bg-gray-500"
      case "in-use":
        return "bg-yellow-500"
      case "maintenance":
        return "bg-red-500"
      case "planned":
        return "bg-blue-500"
      case "in-progress":
        return "bg-yellow-500"
      case "completed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Verfügbar"
      case "busy":
        return "Beschäftigt"
      case "vacation":
        return "Urlaub"
      case "in-use":
        return "Im Einsatz"
      case "maintenance":
        return "Wartung"
      case "planned":
        return "Geplant"
      case "in-progress":
        return "In Bearbeitung"
      case "completed":
        return "Abgeschlossen"
      default:
        return status
    }
  }

  const handleAddEmployee = (formData: FormData) => {
    const newEmployee: Employee = {
      id: employees.length + 1,
      name: `${formData.get("firstName")} ${formData.get("lastName")}`,
      role: formData.get("role") as string,
      rating: 0,
      status: "available",
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      ordersCompleted: 0,
      monthlyEarnings: 0,
    }
    setEmployees([...employees, newEmployee])
    setShowAddEmployee(false)
  }

  const handleDeleteEmployee = () => {
    if (selectedEmployee) {
      setEmployees(employees.filter((e) => e.id !== selectedEmployee.id))
      setShowDeleteConfirm(false)
      setSelectedEmployee(null)
    }
  }

  const handleMessageEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowMessageDialog(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setEditFormData({
      name: employee.name,
      role: employee.role,
      phone: employee.phone,
      email: employee.email,
    })
    setShowEditEmployee(true)
  }

  const handleSaveEmployee = () => {
    if (selectedEmployee) {
      setEmployees((prev) => prev.map((emp) => (emp.id === selectedEmployee.id ? { ...emp, ...editFormData } : emp)))
      setShowEditEmployee(false)
      setSelectedEmployee(null)
      alert("Mitarbeiter wurde aktualisiert!")
    }
  }

  const handleOpenDeleteConfirm = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowDeleteConfirm(true)
  }

  const handleViewOrderDetails = (order: TeamOrder) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleEditOrderDirect = (order: TeamOrder) => {
    setSelectedOrder(order)
    setEditOrderData({
      title: order.title,
      address: order.address,
      status: order.status,
    })
    setShowEditOrder(true)
  }

  const handleEditOrder = () => {
    if (selectedOrder) {
      setTeamOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id
            ? {
                ...order,
                title: editOrderData.title,
                address: editOrderData.address,
                status: editOrderData.status as TeamOrder["status"],
              }
            : order,
        ),
      )
      setShowEditOrder(false)
      setSelectedOrder(null)
      alert("Auftrag wurde aktualisiert!")
    }
  }

  const handleLogout = () => {
    router.push("/anmelden")
  }

  const calendarSchedule: Record<number, { employee: string; task: string; time: string }[]> = {
    18: [
      { employee: "Max Müller", task: "Elektroinstallation", time: "09:00-12:00" },
      { employee: "Thomas Bauer", task: "Gartenarbeit", time: "14:00-17:00" },
    ],
    20: [{ employee: "Anna Schmidt", task: "Gebäudereinigung", time: "08:00-16:00" }],
    22: [
      { employee: "Max Müller", task: "Notfall-Reparatur", time: "10:00-14:00" },
      { employee: "Anna Schmidt", task: "Fensterreinigung", time: "09:00-12:00" },
      { employee: "Thomas Bauer", task: "Hecke schneiden", time: "13:00-16:00" },
    ],
    25: [
      { employee: "Thomas Bauer", task: "Winterdienst", time: "06:00-10:00" },
      { employee: "Max Müller", task: "Heizungswartung", time: "11:00-15:00" },
    ],
  }

  const handleDayClick = (day: number) => {
    setSelectedCalendarDay(day)
    setShowDayDialog(true)
  }

  const handleAssignEmployee = () => {
    setShowAssignDialog(false)
    // In real app, this would update the schedule
  }

  return (
    <div className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
      <VerificationPopup
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        onVerify={handleVerificationComplete}
        contactMethod="email"
      />

      {!isVerified && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl mb-6">
          <div className="px-4 py-3 flex items-center justify-between">
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Müller & Partner GmbH</h1>
            <p className="text-muted-foreground">Handwerksunternehmen - {employees.length} Mitarbeiter</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => alert("Berichte werden generiert...")}
          >
            <FileText className="w-4 h-4" />
            Berichte
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => setShowAddOrder(true)}>
            <Plus className="w-4 h-4" />
            Neuer Auftrag
          </Button>
          <Button variant="outline" onClick={handleLogout} className="bg-transparent">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-muted/50 p-1 h-auto">
          <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-background">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden md:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2 data-[state=active]:bg-background">
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2 data-[state=active]:bg-background">
            <Briefcase className="w-4 h-4" />
            <span className="hidden md:inline">Aufträge</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2 data-[state=active]:bg-background">
            <Car className="w-4 h-4" />
            <span className="hidden md:inline">Ressourcen</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2 data-[state=active]:bg-background">
            <Calendar className="w-4 h-4" />
            <span className="hidden md:inline">Kalender</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card dark:bg-[#1a2420]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monatsumsatz</p>
                    <p className="text-2xl font-bold text-foreground">€{companyStats.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-green-500">+12% vs. Vormonat</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Euro className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card dark:bg-[#1a2420]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Aufträge gesamt</p>
                    <p className="text-2xl font-bold text-foreground">{companyStats.totalOrders}</p>
                    <p className="text-xs text-muted-foreground">{companyStats.completedThisMonth} abgeschlossen</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card dark:bg-[#1a2420]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Kundenzufriedenheit</p>
                    <p className="text-2xl font-bold text-foreground">{companyStats.customerSatisfaction}★</p>
                    <p className="text-xs text-muted-foreground">Aus 156 Bewertungen</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card dark:bg-[#1a2420]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Aktive Mitarbeiter</p>
                    <p className="text-2xl font-bold text-foreground">
                      {companyStats.activeEmployees}/{employees.length}
                    </p>
                    <p className="text-xs text-muted-foreground">1 im Urlaub</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Performance */}
          <Card className="bg-card dark:bg-[#1a2420]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Mitarbeiter-Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      {employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground truncate">{employee.name}</span>
                        <span className="text-sm text-muted-foreground">€{employee.monthlyEarnings}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(employee.monthlyEarnings / 4000) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">{employee.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders & Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card dark:bg-[#1a2420]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Aktuelle Aufträge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {teamOrders
                  .filter((o) => o.status !== "completed")
                  .slice(0, 3)
                  .map((order) => (
                    <div key={order.id} className="p-3 rounded-lg bg-muted/50 dark:bg-[#0f1512]">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-foreground">{order.title}</h4>
                          <p className="text-sm text-muted-foreground">{order.client}</p>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {order.assignedEmployees.join(", ")}
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card className="bg-card dark:bg-[#1a2420]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Auftragsverteilung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Elektrik", value: 35, color: "bg-blue-500" },
                    { label: "Sanitär", value: 25, color: "bg-green-500" },
                    { label: "Reinigung", value: 20, color: "bg-yellow-500" },
                    { label: "Garten", value: 12, color: "bg-purple-500" },
                    { label: "Maler", value: 8, color: "bg-pink-500" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="flex-1 text-sm text-foreground">{item.label}</span>
                      <span className="text-sm font-medium text-muted-foreground">{item.value}%</span>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Mitarbeiter ({employees.length} aktiv)</h2>
            <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  <UserPlus className="w-4 h-4" />
                  Mitarbeiter hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card dark:bg-[#1a2420]">
                <DialogHeader>
                  <DialogTitle>Neuen Mitarbeiter hinzufügen</DialogTitle>
                  <DialogDescription>Fügen Sie einen neuen Mitarbeiter zu Ihrem Team hinzu.</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleAddEmployee(formData)
                  }}
                >
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Vorname</Label>
                        <Input
                          name="firstName"
                          placeholder="Max"
                          className="bg-background dark:bg-[#0f1512]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nachname</Label>
                        <Input
                          name="lastName"
                          placeholder="Mustermann"
                          className="bg-background dark:bg-[#0f1512]"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Fachbereich</Label>
                      <Select name="role" defaultValue="elektriker" required>
                        <SelectTrigger className="bg-background dark:bg-[#0f1512]">
                          <SelectValue placeholder="Fachbereich wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="elektriker">Elektriker</SelectItem>
                          <SelectItem value="sanitär">Sanitär</SelectItem>
                          <SelectItem value="reinigung">Reinigung</SelectItem>
                          <SelectItem value="garten">Gartenpflege</SelectItem>
                          <SelectItem value="maler">Malerarbeiten</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>E-Mail</Label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="max@firma.de"
                        className="bg-background dark:bg-[#0f1512]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefon</Label>
                      <Input
                        name="phone"
                        placeholder="+49 151 1234567"
                        className="bg-background dark:bg-[#0f1512]"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                      Mitarbeiter hinzufügen
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {employees.map((employee) => (
              <Card key={employee.id} className="bg-card dark:bg-[#1a2420]">
                <CardContent className="pt-6">
                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => setExpandedEmployee(expandedEmployee === employee.id ? null : employee.id)}
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary text-lg font-semibold">
                      {employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{employee.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {employee.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {employee.rating}
                        </span>
                        <span>{employee.ordersCompleted} Aufträge</span>
                        <span>€{employee.monthlyEarnings}/Monat</span>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(employee.status)} text-white`}>
                      {getStatusText(employee.status)}
                    </Badge>
                    {expandedEmployee === employee.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  {expandedEmployee === employee.id && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{employee.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{employee.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 bg-transparent"
                            onClick={() => handleMessageEmployee(employee)}
                          >
                            <MessageSquare className="w-4 h-4" />
                            Nachricht
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 bg-transparent"
                            onClick={() => handleEditEmployee(employee)}
                          >
                            <Edit2 className="w-4 h-4" />
                            Bearbeiten
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-red-500 hover:text-red-600 bg-transparent"
                            onClick={() => handleOpenDeleteConfirm(employee)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Auftrags-Koordination</h2>
            <Dialog open={showAddOrder} onOpenChange={setShowAddOrder}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4" />
                  Großauftrag erstellen
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card dark:bg-[#1a2420] max-w-lg">
                <DialogHeader>
                  <DialogTitle>Neuen Großauftrag erstellen</DialogTitle>
                  <DialogDescription>Erstellen Sie einen Auftrag mit mehreren Mitarbeitern.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Auftragstitel</Label>
                    <Input placeholder="z.B. Komplette Renovierung" className="bg-background dark:bg-[#0f1512]" />
                  </div>
                  <div className="space-y-2">
                    <Label>Kunde</Label>
                    <Input placeholder="Kundenname" className="bg-background dark:bg-[#0f1512]" />
                  </div>
                  <div className="space-y-2">
                    <Label>Adresse</Label>
                    <Input placeholder="Straße, PLZ Ort" className="bg-background dark:bg-[#0f1512]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Datum</Label>
                      <Input type="date" className="bg-background dark:bg-[#0f1512]" />
                    </div>
                    <div className="space-y-2">
                      <Label>Auftragswert</Label>
                      <Input type="number" placeholder="€" className="bg-background dark:bg-[#0f1512]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Mitarbeiter zuweisen</Label>
                    <div className="flex flex-wrap gap-2">
                      {employees.map((emp) => (
                        <Badge key={emp.id} variant="outline" className="cursor-pointer hover:bg-primary/10">
                          {emp.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90">Auftrag erstellen</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {teamOrders.map((order) => (
              <Card key={order.id} className="bg-card dark:bg-[#1a2420]">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        order.status === "completed"
                          ? "bg-green-500/10"
                          : order.status === "in-progress"
                            ? "bg-yellow-500/10"
                            : "bg-blue-500/10"
                      }`}
                    >
                      {order.status === "completed" ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : order.status === "in-progress" ? (
                        <Clock className="w-6 h-6 text-yellow-500" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{order.title}</h3>
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.client} - {order.address}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.date).toLocaleDateString("de-DE")}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {order.assignedEmployees.length} Mitarbeiter
                        </span>
                        <span className="font-semibold text-primary">€{order.value.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {order.assignedEmployees.map((emp) => (
                        <Badge key={emp} variant="outline" className="text-xs">
                          {emp.split(" ")[0]}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewOrderDetails(order)}>
                        Details
                      </Button>
                      {order.status !== "completed" && (
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => handleEditOrderDirect(order)}
                        >
                          Bearbeiten
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Ressourcen-Verwaltung</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Vehicles */}
            <Card className="bg-card dark:bg-[#1a2420]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  Fahrzeuge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {resources
                  .filter((r) => r.type === "vehicle")
                  .map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 dark:bg-[#0f1512]"
                    >
                      <div className="flex items-center gap-3">
                        <Car className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{resource.name}</p>
                          {resource.assignedTo && (
                            <p className="text-xs text-muted-foreground">Zugewiesen: {resource.assignedTo}</p>
                          )}
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(resource.status)} text-white`}>
                        {getStatusText(resource.status)}
                      </Badge>
                    </div>
                  ))}
                <Button
                  variant="outline"
                  className="w-full gap-2 bg-transparent"
                  onClick={() => setShowAddVehicle(true)}
                >
                  <Plus className="w-4 h-4" />
                  Fahrzeug hinzufügen
                </Button>
              </CardContent>
            </Card>

            {/* Tools */}
            <Card className="bg-card dark:bg-[#1a2420]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-primary" />
                  Werkzeuge & Ausrüstung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {resources
                  .filter((r) => r.type === "tool")
                  .map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 dark:bg-[#0f1512]"
                    >
                      <div className="flex items-center gap-3">
                        <Wrench className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{resource.name}</p>
                          {resource.assignedTo && (
                            <p className="text-xs text-muted-foreground">Zugewiesen: {resource.assignedTo}</p>
                          )}
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(resource.status)} text-white`}>
                        {getStatusText(resource.status)}
                      </Badge>
                    </div>
                  ))}
                <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={() => setShowAddTool(true)}>
                  <Plus className="w-4 h-4" />
                  Ausrüstung hinzufügen
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Team-Kalender</h2>

          <Card className="bg-card dark:bg-[#1a2420]">
            <CardHeader>
              <CardTitle>Januar 2024</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 31 }, (_, i) => {
                  const day = i + 1
                  const hasOrder = [18, 20, 22, 25].includes(day)
                  const scheduleCount = calendarSchedule[day]?.length || 0
                  return (
                    <div
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`text-center py-3 rounded-lg cursor-pointer transition-colors ${
                        hasOrder
                          ? "bg-primary/10 text-primary font-semibold hover:bg-primary/20"
                          : "hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      {day}
                      {hasOrder && (
                        <div className="flex justify-center gap-0.5 mt-1">
                          {Array.from({ length: Math.min(scheduleCount, 3) }, (_, i) => (
                            <div key={i} className="w-1 h-1 bg-primary rounded-full" />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Team Schedule */}
              <div className="border-t border-border pt-4 mt-4">
                <h4 className="font-medium text-foreground mb-3">Team-Übersicht heute</h4>
                <div className="space-y-2">
                  {employees.map((emp) => (
                    <div key={emp.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 dark:bg-[#0f1512]">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(emp.status)}`} />
                      <span className="font-medium text-foreground flex-1">{emp.name}</span>
                      <span className="text-sm text-muted-foreground">{emp.role}</span>
                      <Badge variant="outline" className="text-xs">
                        {emp.status === "busy" ? "Im Einsatz" : emp.status === "vacation" ? "Urlaub" : "Frei"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle>Nachricht an {selectedEmployee?.name}</DialogTitle>
            <DialogDescription>Senden Sie eine Nachricht an Ihren Mitarbeiter</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
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
              onClick={() => {
                setShowMessageDialog(false)
                alert("Nachricht gesendet!")
              }}
            >
              Senden
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle>Mitarbeiter entfernen?</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie {selectedEmployee?.name} aus dem Team entfernen möchten?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowDeleteConfirm(false)}>
              Abbrechen
            </Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteEmployee}>
              <Trash2 className="w-4 h-4 mr-2" />
              Entfernen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="bg-card dark:bg-[#1a2420] max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedOrder?.title}</DialogTitle>
            <DialogDescription>Auftragsdetails</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Kunde</p>
                <p className="font-medium text-foreground">{selectedOrder?.client}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Auftragswert</p>
                <p className="font-medium text-primary">€{selectedOrder?.value.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-medium text-foreground">{selectedOrder?.address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Datum</p>
                <p className="font-medium text-foreground">{selectedOrder?.date}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Zugewiesene Mitarbeiter</p>
              <div className="flex flex-wrap gap-2">
                {selectedOrder?.assignedEmployees.map((emp) => (
                  <Badge key={emp} variant="outline">
                    {emp}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowOrderDetails(false)}>
              Schließen
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleEditOrder}>
              Bearbeiten
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditEmployee} onOpenChange={setShowEditEmployee}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle>Mitarbeiter bearbeiten</DialogTitle>
            <DialogDescription>Aktualisieren Sie die Daten von {selectedEmployee?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-background dark:bg-[#0f1512]"
              />
            </div>
            <div className="space-y-2">
              <Label>Rolle / Fachgebiet</Label>
              <Input
                value={editFormData.role}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, role: e.target.value }))}
                className="bg-background dark:bg-[#0f1512]"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input
                value={editFormData.phone}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="bg-background dark:bg-[#0f1512]"
              />
            </div>
            <div className="space-y-2">
              <Label>E-Mail</Label>
              <Input
                value={editFormData.email}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="bg-background dark:bg-[#0f1512]"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowEditEmployee(false)}>
              Abbrechen
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleSaveEmployee}>
              Speichern
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditOrder} onOpenChange={setShowEditOrder}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle>Auftrag bearbeiten</DialogTitle>
            <DialogDescription>Aktualisieren Sie die Auftragsdaten</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input
                value={editOrderData.title}
                onChange={(e) => setEditOrderData((prev) => ({ ...prev, title: e.target.value }))}
                className="bg-background dark:bg-[#0f1512]"
              />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={editOrderData.address}
                onChange={(e) => setEditOrderData((prev) => ({ ...prev, address: e.target.value }))}
                className="bg-background dark:bg-[#0f1512]"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={editOrderData.status}
                onChange={(e) => setEditOrderData((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full p-2 rounded-md bg-background dark:bg-[#0f1512] border border-border"
              >
                <option value="planned">Geplant</option>
                <option value="in-progress">In Bearbeitung</option>
                <option value="completed">Abgeschlossen</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowEditOrder(false)}>
              Abbrechen
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleEditOrder}>
              Speichern
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle>Fahrzeug hinzufügen</DialogTitle>
            <DialogDescription>Fügen Sie ein neues Fahrzeug zur Flotte hinzu</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Fahrzeugname</Label>
              <Input placeholder="z.B. VW Transporter" className="bg-background dark:bg-[#0f1512]" />
            </div>
            <div className="space-y-2">
              <Label>Kennzeichen</Label>
              <Input placeholder="B-XX 1234" className="bg-background dark:bg-[#0f1512]" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAddVehicle(false)}>
              Abbrechen
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => {
                setShowAddVehicle(false)
                alert("Fahrzeug hinzugefügt!")
              }}
            >
              Hinzufügen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddTool} onOpenChange={setShowAddTool}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle>Ausrüstung hinzufügen</DialogTitle>
            <DialogDescription>Fügen Sie neue Werkzeuge oder Ausrüstung hinzu</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Bezeichnung</Label>
              <Input placeholder="z.B. Bohrmaschinen-Set" className="bg-background dark:bg-[#0f1512]" />
            </div>
            <div className="space-y-2">
              <Label>Seriennummer (optional)</Label>
              <Input placeholder="SN-12345" className="bg-background dark:bg-[#0f1512]" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAddTool(false)}>
              Abbrechen
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => {
                setShowAddTool(false)
                alert("Ausrüstung hinzugefügt!")
              }}
            >
              Hinzufügen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDayDialog} onOpenChange={setShowDayDialog}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selectedCalendarDay} Jan 2024</DialogTitle>
            <DialogDescription>Team-Einsatzplan für diesen Tag</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCalendarDay && calendarSchedule[selectedCalendarDay] ? (
              <div className="space-y-3">
                {calendarSchedule[selectedCalendarDay].map((schedule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 dark:bg-[#0f1512]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{schedule.employee}</p>
                        <p className="text-sm text-muted-foreground">{schedule.task}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {schedule.time}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Keine Einsätze geplant</p>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-border">
              <Button className="flex-1 bg-transparent" variant="outline" onClick={() => setShowAssignDialog(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Mitarbeiter einplanen
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => {
                  setShowDayDialog(false)
                  setShowAddOrder(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Auftrag erstellen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="bg-card dark:bg-[#1a2420]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Mitarbeiter einplanen</DialogTitle>
            <DialogDescription>
              Planen Sie einen Mitarbeiter für den {selectedCalendarDay} Jan 2024 ein
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Mitarbeiter</Label>
              <Select>
                <SelectTrigger className="bg-background dark:bg-[#0f1512] border-border">
                  <SelectValue placeholder="Mitarbeiter auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.name} - {emp.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Aufgabe</Label>
              <Input placeholder="z.B. Elektroinstallation" className="bg-background dark:bg-[#0f1512] border-border" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Von</Label>
                <Input type="time" defaultValue="09:00" className="bg-background dark:bg-[#0f1512] border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Bis</Label>
                <Input type="time" defaultValue="17:00" className="bg-background dark:bg-[#0f1512] border-border" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Adresse</Label>
              <Input placeholder="Einsatzort" className="bg-background dark:bg-[#0f1512] border-border" />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Notizen</Label>
              <Textarea
                placeholder="Zusätzliche Informationen..."
                className="bg-background dark:bg-[#0f1512] border-border"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAssignDialog(false)}>
                Abbrechen
              </Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleAssignEmployee}>
                Einplanen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
