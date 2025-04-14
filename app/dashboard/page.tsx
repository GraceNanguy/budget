"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, ArrowRight, BarChart2 } from "lucide-react";
import { Transaction } from "@/lib/types";
import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { TransactionList } from "@/components/transaction-list";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
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
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useToast } from "@/components/ui/use-toast";
import { ensureValidDate, formatAmount } from "@/lib/utils";

const getDemoData = () => {
  return [
    { month: "Jan", expenses: 120000, income: 350000 },
    { month: "Fév", expenses: 150000, income: 350000 },
    { month: "Mar", expenses: 180000, income: 400000 },
    { month: "Avr", expenses: 200000, income: 380000 },
    { month: "Mai", expenses: 160000, income: 420000 },
    { month: "Juin", expenses: 190000, income: 450000 },
  ];
};

const getLast6Months = () => {
  const months = [];
  const currentDate = new Date();

  for (let i = 5; i >= 0; i--) {
    const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = month.toLocaleDateString("fr-FR", { month: "short" });
    months.push({
      month: monthName,
      expenses: 0,
      income: 0,
    });
  }

  return months;
};

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Transaction[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState(getLast6Months());
  const [hasRealData, setHasRealData] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const notificationsRef = useRef<{ id: string; message: string }[]>([]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserName(user.displayName || user.email?.split("@")[0] || "Utilisateur");

        try {
          const transactionsRef = collection(db, "transactions");
          const q = query(transactionsRef, where("userId", "==", user.uid));

          const unsubscribeTransactions = onSnapshot(
            q,
            (snapshot) => {
              const transactionsData = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                  id: doc.id,
                  type: data.type as "expense" | "income" | "budget",
                  amount: Number(data.amount) || 0,
                  userId: data.userId || user.uid,
                  createdAt: Number(data.createdAt) || Date.now(),
                  date: data.date, // Timestamp (number)
                  description: data.description || "",
                  category: data.category, // Peut être undefined
                  spent: data.spent !== undefined ? Number(data.spent) : undefined,
                  updatedAt: data.updatedAt,
                  recurring: data.recurring,
                  recurringPeriod: data.recurringPeriod,
                } as Transaction;
              });

              const transactionsOnly = transactionsData.filter(
                (t) => t.type === "expense" || t.type === "income"
              );
              const budgetsOnly = transactionsData.filter((t) => t.type === "budget");

              setTransactions(transactionsOnly);
              setBudgets(budgetsOnly);

              checkBudgets(budgetsOnly, transactionsOnly);
              setIsLoading(false);

              if (transactionsOnly.length > 0) {
                updateChartData(transactionsOnly);
                setHasRealData(true);
              } else {
                setMonthlyData(getDemoData());
                setHasRealData(false);
              }
            },
            (error) => {
              console.error("Erreur lors de la récupération des transactions :", error);
              setIsLoading(false);
              setMonthlyData(getDemoData());
              setHasRealData(false);
            }
          );

          return () => unsubscribeTransactions();
        } catch (error) {
          console.error("Erreur lors de la configuration de l'écouteur de transactions :", error);
          setIsLoading(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push("/auth");
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  const checkBudgets = (budgets: Transaction[], expenses: Transaction[]) => {
    const notifications: { id: string; message: string }[] = [];

    for (const budget of budgets) {
      const categoryExpenses = expenses.filter(
        (e) => e.type === "expense" && e.category === budget.category
      );
      const spent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0) || 0;

      try {
        updateDoc(doc(db, "transactions", budget.id), { spent });

        const percentUsed = (spent / budget.amount) * 100;
        const budgetName = budget.description || getCategoryLabel(budget.category || "");

        if (percentUsed >= 80 && percentUsed < 100) {
          const notificationId = `budget-warning-${budget.id}`;
          const message = `Votre budget ${budgetName} est utilisé à ${Math.round(percentUsed)}%`;
          if (!notificationsRef.current.some((n) => n.id === notificationId)) {
            notifications.push({ id: notificationId, message });
            toast({
              title: "Alerte budget",
              description: message,
              variant: "destructive",
            });
          }
        }

        if (percentUsed >= 100) {
          const notificationId = `budget-exceeded-${budget.id}`;
          const message = `Votre budget ${budgetName} est dépassé de ${formatAmount(spent - budget.amount)}`;
          if (!notificationsRef.current.some((n) => n.id === notificationId)) {
            notifications.push({ id: notificationId, message });
            toast({
              title: "Budget dépassé",
              description: message,
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour du montant dépensé du budget :", error);
      }
    }

    notificationsRef.current = notifications;
    setNotificationCount(notifications.length);
  };

  const updateChartData = (transactionsData: Transaction[]) => {
    const chartData = getLast6Months();

    transactionsData.forEach((transaction) => {
      const validDate = ensureValidDate(transaction.date);
      const transactionMonth = validDate.toLocaleDateString("fr-FR", { month: "short" });
      const monthData = chartData.find((data) => data.month === transactionMonth);

      if (monthData) {
        if (transaction.type === "expense") {
          monthData.expenses += transaction.amount;
        } else if (transaction.type === "income") {
          monthData.income += transaction.amount;
        }
      }
    });

    setMonthlyData(chartData);
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      food: "Alimentation",
      transport: "Transport",
      housing: "Logement",
      utilities: "Factures",
      entertainment: "Divertissement",
      health: "Santé",
      education: "Éducation",
      shopping: "Shopping",
    };
    return categories[category as keyof typeof categories] || category;
  };

  const handleAddTransaction = async (data: any) => {
    if (!auth.currentUser) {
      router.push("/auth");
      return;
    }

    try {
      const date = ensureValidDate(data.date).getTime();
      const transactionData = {
        type: data.type as "expense" | "income" | "budget",
        amount: Number(data.amount),
        userId: auth.currentUser.uid,
        createdAt: Date.now(),
        date,
        description: data.description || "",
        category: data.category, // Peut être undefined
        spent: data.type === "budget" ? 0 : null,
        updatedAt: Date.now(),
        recurring: data.recurring || false,
        recurringPeriod: data.recurring ? data.recurringPeriod ?? "monthly" : null,
      };

      await addDoc(collection(db, "transactions"), transactionData);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la transaction :", error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!auth.currentUser) {
      router.push("/auth");
      return;
    }

    try {
      await deleteDoc(doc(db, "transactions", id));
    } catch (error) {
      console.error("Erreur lors de la suppression de la transaction :", error);
    }
  };

  if (!isAuthenticated && !isLoading) {
    return null;
  }

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const hasTransactions = transactions.length > 0;
  const hasBudgets = budgets.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MainNav notificationCount={notificationCount} userName={userName} />
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-4 md:gap-8 max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Bonjour {userName},</h1>
            <p className="text-muted-foreground">Bienvenue dans votre application de gestion de budget</p>
          </div>

          {isLoading ? (
            <div className="h-24 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Solde actuel</CardDescription>
                    <CardTitle className="text-2xl">{formatAmount(balance)}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Revenus</CardDescription>
                    <CardTitle className="text-2xl text-green-500">{formatAmount(totalIncome)}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Dépenses</CardDescription>
                    <CardTitle className="text-2xl text-blue-500">{formatAmount(totalExpenses)}</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl">Aperçu des statistiques</CardTitle>
                    <CardDescription>
                      {hasRealData
                        ? "Revenus vs Dépenses des 6 derniers mois"
                        : "Données fictives - Ajoutez des transactions pour voir vos données réelles"}
                    </CardDescription>
                  </div>
                  <Link href="/statistics">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <BarChart2 className="h-4 w-4" />
                      Voir plus
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          label={{ value: "Mois", position: "insideBottomRight", offset: -10 }}
                        />
                        <YAxis
                          label={{ value: "Montant (FCFA)", angle: -90, position: "insideLeft" }}
                          tickFormatter={(value) => `${Math.floor(value / 1000)}k`}
                          ticks={[0, 100000, 200000, 300000, 400000, 500000]}
                        />
                        <Tooltip formatter={(value) => `${formatAmount(Number(value))}`} />
                        <Bar dataKey="income" name="Revenus" fill="#4ade80" />
                        <Bar dataKey="expenses" name="Dépenses" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link href="/statistics" className="w-full">
                    <Button variant="outline" className="w-full gap-1">
                      Statistiques détaillées
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </>
          )}

          <Tabs defaultValue="expenses" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="expenses">Dépenses</TabsTrigger>
                <TabsTrigger value="income">Revenus</TabsTrigger>
                <TabsTrigger value="budgets">Budgets</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <TabsContent value="expenses" className="m-0">
                  <AddTransactionDialog
                    type="expense"
                    onAdd={handleAddTransaction}
                    trigger={
                      <Button size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        Dépense
                      </Button>
                    }
                  />
                </TabsContent>
                <TabsContent value="income" className="m-0">
                  <AddTransactionDialog
                    type="income"
                    onAdd={handleAddTransaction}
                    trigger={
                      <Button size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        Revenu
                      </Button>
                    }
                  />
                </TabsContent>
                <TabsContent value="budgets" className="m-0">
                  <AddTransactionDialog
                    type="budget"
                    onAdd={handleAddTransaction}
                    trigger={
                      <Button size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        Budget
                      </Button>
                    }
                  />
                </TabsContent>
              </div>
            </div>
            <TabsContent value="expenses" className="mt-0">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Dépenses récentes</CardTitle>
                    <CardDescription>Vos 3 dernières dépenses sont affichées ici.</CardDescription>
                  </div>
                  <Link href="/expenses">
                    <Button variant="outline" size="sm">
                      Voir tout
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {hasTransactions ? (
                    <TransactionList
                      transactions={transactions.filter((t) => t.type === "expense")}
                      type="expense"
                      limit={3}
                      onDelete={handleDeleteTransaction}
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Aucune dépense enregistrée</p>
                      <p className="text-sm mt-2">Cliquez sur "Dépense" pour ajouter votre première dépense</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="income" className="mt-0">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Revenus récents</CardTitle>
                    <CardDescription>Vos 3 derniers revenus sont affichés ici.</CardDescription>
                  </div>
                  <Link href="/income">
                    <Button variant="outline" size="sm">
                      Voir tout
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {hasTransactions ? (
                    <TransactionList
                      transactions={transactions.filter((t) => t.type === "income")}
                      type="income"
                      limit={3}
                      onDelete={handleDeleteTransaction}
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Aucun revenu enregistré</p>
                      <p className="text-sm mt-2">Cliquez sur "Revenu" pour ajouter votre premier revenu</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="budgets" className="mt-0">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Budgets actifs</CardTitle>
                    <CardDescription>Vos 3 derniers budgets sont affichés ici.</CardDescription>
                  </div>
                  <Link href="/budgets">
                    <Button variant="outline" size="sm">
                      Voir tout
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {hasBudgets ? (
                    <TransactionList
                      transactions={budgets}
                      type="budget"
                      limit={3}
                      onDelete={handleDeleteTransaction}
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Aucun budget enregistré</p>
                      <p className="text-sm mt-2">Cliquez sur "Budget" pour ajouter votre premier budget</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}