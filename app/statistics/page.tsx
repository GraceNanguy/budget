"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

// Formater les montants en FCFA
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("fr-CI", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount)
}

// Fonction pour s'assurer qu'une date est valide
const ensureValidDate = (dateInput: any): Date => {
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput
  }

  // Si c'est un timestamp numérique
  if (typeof dateInput === "number") {
    return new Date(dateInput)
  }

  // Si c'est un objet Firestore Timestamp
  if (dateInput && typeof dateInput.toDate === "function") {
    return dateInput.toDate()
  }

  // Si c'est une chaîne de caractères
  if (typeof dateInput === "string") {
    const parsedDate = new Date(dateInput)
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate
    }
  }

  // Fallback à la date actuelle si aucune conversion n'est possible
  console.warn("Date invalide détectée, utilisation de la date actuelle comme fallback", dateInput)
  return new Date()
}

// Générer les options de mois/année pour le sélecteur
const generateMonthYearOptions = () => {
  const options = []
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Générer les options pour les 24 derniers mois
  for (let i = 0; i < 24; i++) {
    const year = currentYear - Math.floor((i - currentMonth) / 12)
    const month = (currentMonth - (i % 12) + 12) % 12

    const date = new Date(year, month, 1)
    const monthName = date.toLocaleDateString("fr-FR", { month: "long" })
    const value = `${year}-${month + 1}`
    const label = `${monthName} ${year}`

    options.push({ value, label })
  }

  return options
}

export default function StatisticsPage() {
  const router = useRouter()
  const [selectedMonthYear, setSelectedMonthYear] = useState("")
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [incomeData, setIncomeData] = useState<any[]>([])
  const [userName, setUserName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [hasData, setHasData] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const monthYearOptions = generateMonthYearOptions()
  const [allTransactions, setAllTransactions] = useState<any[]>([])

  // Charger les données utilisateur et définir le mois par défaut
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsAuthenticated(true)
        setUserName(user.displayName || user.email?.split("@")[0] || "Utilisateur")

        // Utiliser la date de création du compte comme mois par défaut
        if (user.metadata && user.metadata.creationTime) {
          const creationDate = new Date(user.metadata.creationTime)
          const creationYear = creationDate.getFullYear()
          const creationMonth = creationDate.getMonth() + 1
          setSelectedMonthYear(`${creationYear}-${creationMonth}`)
        } else {
          // Fallback au mois actuel
          const currentDate = new Date()
          const currentYear = currentDate.getFullYear()
          const currentMonth = currentDate.getMonth() + 1
          setSelectedMonthYear(`${currentYear}-${currentMonth}`)
        }

        try {
          // Get transactions
          const transactionsRef = collection(db, "transactions")
          // Assurez-vous que cette requête filtre par userId
          const q = query(transactionsRef, where("userId", "==", user.uid))
          const querySnapshot = await getDocs(q)

          const transactionsData = querySnapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              // Assurer que la date est un objet Date valide
              date: ensureValidDate(data.date),
            }
          })

          setAllTransactions(transactionsData)

          if (transactionsData.length > 0) {
            // Filtrer les données selon le mois/année sélectionné
            const filteredData = filterDataByMonthYear(transactionsData, selectedMonthYear)
            updateChartData(filteredData)
            updateCategoryData(filteredData)
            updateIncomeData(filteredData)
            setHasData(filteredData.length > 0)
          } else {
            setHasData(false)
            // Réinitialiser les données des graphiques
            setMonthlyData([])
            setCategoryData([])
            setIncomeData([])
          }

          setIsLoading(false)
        } catch (error) {
          console.error("Error fetching data:", error)
          setIsLoading(false)
        }
      } else {
        setIsAuthenticated(false)
        setIsLoading(false)
        // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
        router.push("/auth")
      }
    })

    return () => unsubscribeAuth()
  }, [router])

  // Mettre à jour les données lorsque le mois sélectionné change
  useEffect(() => {
    if (allTransactions.length > 0 && selectedMonthYear) {
      const filteredData = filterDataByMonthYear(allTransactions, selectedMonthYear)
      updateChartData(filteredData)
      updateCategoryData(filteredData)
      updateIncomeData(filteredData)
      setHasData(filteredData.length > 0)
    }
  }, [selectedMonthYear, allTransactions])

  // Si l'utilisateur n'est pas authentifié et que le chargement est terminé, ne rien afficher
  // La redirection sera gérée par le useEffect
  if (!isAuthenticated && !isLoading) {
    return null
  }

  // Filtrer les données par mois/année
  const filterDataByMonthYear = (data: any[], monthYear: string) => {
    if (!monthYear || monthYear === "all") return data

    const [year, month] = monthYear.split("-").map(Number)

    return data.filter((item) => {
      const itemDate = ensureValidDate(item.date)
      return itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month
    })
  }

  // Update chart data based on transactions
  const updateChartData = (transactionsData: any[]) => {
    // Toujours afficher les données mensuelles
    const monthsData: { [key: string]: { month: string; expenses: number; income: number } } = {}

    transactionsData.forEach((transaction) => {
      if (transaction.type !== "expense" && transaction.type !== "income") return

      const validDate = ensureValidDate(transaction.date)
      const monthKey = validDate.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })

      if (!monthsData[monthKey]) {
        monthsData[monthKey] = {
          month: validDate.toLocaleDateString("fr-FR", { month: "short" }),
          expenses: 0,
          income: 0,
        }
      }

      if (transaction.type === "expense") {
        monthsData[monthKey].expenses += transaction.amount
      } else if (transaction.type === "income") {
        monthsData[monthKey].income += transaction.amount
      }
    })

    setMonthlyData(Object.values(monthsData))
  }

  // Update category data for pie chart
  const updateCategoryData = (transactionsData: any[]) => {
    const categories: { [key: string]: number } = {}

    transactionsData.forEach((transaction) => {
      if (transaction.type === "expense") {
        if (!categories[transaction.category]) {
          categories[transaction.category] = 0
        }
        categories[transaction.category] += transaction.amount
      }
    })

    const colors = [
      "#3b82f6", // Blue
      "#22c55e", // Green
      "#06b6d4", // Cyan
      "#14b8a6", // Teal
      "#0ea5e9", // Light Blue
      "#84cc16", // Lime
      "#10b981", // Emerald
      "#4ade80", // Light Green
    ]

    const formattedData = Object.keys(categories).map((category, index) => ({
      name: getCategoryLabel(category),
      value: categories[category],
      color: colors[index % colors.length],
    }))

    setCategoryData(formattedData)
  }

  // Update income data for pie chart
  const updateIncomeData = (transactionsData: any[]) => {
    const categories: { [key: string]: number } = {}

    transactionsData.forEach((transaction) => {
      if (transaction.type === "income") {
        if (!categories[transaction.category]) {
          categories[transaction.category] = 0
        }
        categories[transaction.category] += transaction.amount
      }
    })

    const colors = [
      "#22c55e", // Green
      "#84cc16", // Lime
      "#10b981", // Emerald
      "#4ade80", // Light Green
      "#059669", // Dark Green
    ]

    const formattedData = Object.keys(categories).map((category, index) => ({
      name: getCategoryLabel(category),
      value: categories[category],
      color: colors[index % colors.length],
    }))

    setIncomeData(formattedData)
  }

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      // Income categories
      salary: "Salaire",
      freelance: "Freelance",
      investment: "Investissement",
      gift: "Cadeau",
      other: "Autre",

      // Expense categories
      food: "Alimentation",
      transport: "Transport",
      housing: "Logement",
      utilities: "Factures",
      entertainment: "Divertissement",
      health: "Santé",
      education: "Éducation",
      shopping: "Shopping",
    }

    return categories[category] || category
  }

  // Déterminer le titre du graphique en fonction de la sélection
  const getChartTitle = () => {
    if (selectedMonthYear && selectedMonthYear !== "all") {
      const [year, month] = selectedMonthYear.split("-").map(Number)
      const date = new Date(year, month - 1, 1)
      return `Revenus vs Dépenses - ${date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`
    }
    return "Revenus vs Dépenses par mois"
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MainNav notificationCount={notificationCount} userName={userName} />
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-4 md:gap-8 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Statistiques</h1>
            <Select value={selectedMonthYear} onValueChange={setSelectedMonthYear}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Sélectionner un mois" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les mois</SelectItem>
                {monthYearOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : hasData ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{getChartTitle()}</CardTitle>
                  <CardDescription>Comparaison de vos revenus et dépenses pour la période sélectionnée</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ChartContainer
                      config={{
                        income: {
                          label: "Revenus",
                          color: "hsl(var(--chart-4))",
                        },
                        expenses: {
                          label: "Dépenses",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                    >
                      <BarChart 
                        accessibilityLayer 
                        data={monthlyData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          tickLine={false} 
                          tickMargin={10} 
                          axisLine={false}
                        />
                        <YAxis 
                          label={{ value: "Montant (FCFA)", angle: -90, position: "insideLeft" }}
                          tickFormatter={(value) => `${Math.floor(value / 1000)}k`}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={
                            <ChartTooltipContent 
                              indicator="dashed" 
                              formatter={(value) => formatAmount(Number(value))}
                            />
                          }
                        />
                        <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                        <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="expenses" className="w-full">
                <TabsList>
                  <TabsTrigger value="expenses">Dépenses par catégorie</TabsTrigger>
                  <TabsTrigger value="income">Revenus par source</TabsTrigger>
                </TabsList>
                <TabsContent value="expenses" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Répartition des dépenses</CardTitle>
                      <CardDescription>Visualisez comment vos dépenses sont réparties par catégorie</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        {categoryData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {categoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => formatAmount(Number(value))} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-muted-foreground">Aucune dépense enregistrée pour cette période</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="income" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sources de revenus</CardTitle>
                      <CardDescription>Visualisez la répartition de vos sources de revenus</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        {incomeData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={incomeData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {incomeData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => formatAmount(Number(value))} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-muted-foreground">Aucun revenu enregistré pour cette période</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xl font-medium mb-2">Aucune donnée disponible</p>
                <p className="text-muted-foreground">
                  Ajoutez des transactions pour voir vos statistiques pour cette période
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
