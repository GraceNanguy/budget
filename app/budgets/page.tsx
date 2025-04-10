"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Transaction } from "@/lib/types";
import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { TransactionList } from "@/components/transaction-list";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { ensureValidDate } from "@/lib/utils";

export default function BudgetsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserName(user.displayName || user.email?.split("@")[0] || "Utilisateur");

        try {
          const budgetsRef = collection(db, "transactions");
          const budgetsQuery = query(budgetsRef, where("userId", "==", user.uid), where("type", "==", "budget"));

          const unsubscribeBudgets = onSnapshot(
            budgetsQuery,
            (snapshot) => {
              const budgetsData = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                  id: doc.id,
                  type: "budget" as const,
                  amount: Number(data.amount) || 0,
                  userId: data.userId || user.uid,
                  createdAt: Number(data.createdAt) || Date.now(),
                  date: data.date,
                  description: data.description || "",
                  category: data.category ?? null,
                  spent: Number(data.spent) || 0,
                  updatedAt: data.updatedAt ?? null,
                  recurring: data.recurring ?? false,
                  recurringPeriod: data.recurringPeriod ?? null,
                } as Transaction;
              });

              setBudgets(budgetsData);

              const expensesRef = collection(db, "transactions");
              const expensesQuery = query(expensesRef, where("userId", "==", user.uid), where("type", "==", "expense"));

              const unsubscribeExpenses = onSnapshot(
                expensesQuery,
                (snapshot) => {
                  const expensesData = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                      id: doc.id,
                      type: "expense" as const,
                      amount: Number(data.amount) || 0,
                      userId: data.userId || user.uid,
                      createdAt: Number(data.createdAt) || Date.now(),
                      date: data.date,
                      description: data.description || "",
                      category: data.category ?? null,
                      spent: data.spent ?? null,
                      updatedAt: data.updatedAt ?? null,
                      recurring: data.recurring ?? false,
                      recurringPeriod: data.recurringPeriod ?? null,
                    } as Transaction;
                  });

                  setExpenses(expensesData);
                  updateBudgetSpent(budgetsData, expensesData);
                  setIsLoading(false);
                },
                (error) => {
                  console.error("Error fetching expenses:", error);
                  setIsLoading(false);
                }
              );

              return () => unsubscribeExpenses();
            },
            (error) => {
              console.error("Error fetching budgets:", error);
              setIsLoading(false);
            }
          );

          return () => unsubscribeBudgets();
        } catch (error) {
          console.error("Error setting up budget listener:", error);
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

  const updateBudgetSpent = async (budgets: Transaction[], expenses: Transaction[]) => {
    let notifications = 0;

    for (const budget of budgets) {
      const categoryExpenses = expenses.filter((e) => e.category === budget.category);
      const spent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);

      budget.spent = spent;

      try {
        await updateDoc(doc(db, "transactions", budget.id), { spent });
        const percentUsed = (spent / budget.amount) * 100;
        if (percentUsed >= 80 && percentUsed < 100) {
          notifications++;
          toast({
            title: "Alerte budget",
            description: `Votre budget ${budget.description || getCategoryLabel(budget.category ?? "")} est utilisé à ${Math.round(percentUsed)}%`,
            variant: "destructive",
          });
        }
        if (percentUsed >= 100) {
          notifications++;
          toast({
            title: "Budget dépassé",
            description: `Votre budget ${budget.description || getCategoryLabel(budget.category ?? "")} est dépassé de ${(spent - budget.amount).toFixed(2)} €`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error updating budget spent amount:", error);
      }
    }

    setNotificationCount(notifications);
  };

  const handleAddBudget = async (data: Partial<Transaction>) => {
    if (!auth.currentUser) {
      router.push("/auth");
      return;
    }
  
    try {
      console.log("Données reçues dans handleAddBudget:", data);
      const date = ensureValidDate(data.date).getTime();
      const budgetData = {
        type: "budget" as const,
        amount: Number(data.amount) || 0,
        userId: auth.currentUser.uid,
        createdAt: Date.now(),
        date,
        description: data.description || "",
        category: data.category ?? null,
        spent: 0,
        updatedAt: Date.now(),
        recurring: data.recurring ?? false,
        recurringPeriod: data.recurring ? data.recurringPeriod ?? "monthly" : null, // Aligné avec AddTransactionDialog
      };
      console.log("Données envoyées à Firestore (budgets):", budgetData);
      await addDoc(collection(db, "transactions"), budgetData);
    } catch (error) {
      console.error("Erreur lors de l'ajout du budget :", error);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!auth.currentUser) {
      router.push("/auth");
      return;
    }

    try {
      await deleteDoc(doc(db, "transactions", id));
    } catch (error) {
      console.error("Erreur lors de la suppression du budget :", error);
    }
  };

  const filteredBudgets = budgets.filter(
    (b) =>
      (b.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (b.category?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const totalBudget = filteredBudgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = filteredBudgets.reduce((sum, b) => sum + (b.spent ?? 0), 0);

  const getCategoryLabel = (category: string | null | undefined) => {
    if (!category) return "Sans catégorie"; // Valeur par défaut si category est null ou undefined
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

  if (!isAuthenticated && !isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MainNav notificationCount={notificationCount} userName={userName} />
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-4 md:gap-8 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Budgets</h1>
              <p className="text-muted-foreground">Gérez et suivez tous vos budgets</p>
            </div>
            <AddTransactionDialog
              type="budget"
              onAdd={handleAddBudget}
              trigger={
                <Button className="gap-1">
                  <Plus className="h-4 w-4" />
                  Nouveau budget
                </Button>
              }
            />
          </div>

          <div className="flex items-center gap-4">
            <Input
              placeholder="Rechercher par description ou catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <div className="text-sm text-muted-foreground">
              Total: <span className="font-semibold">{totalBudget.toFixed(2)} €</span> (Dépensé:{" "}
              <span className="font-semibold">{totalSpent.toFixed(2)} €</span>)
            </div>
          </div>

          {isLoading ? (
            <div className="h-24 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Progression des budgets</CardTitle>
                  <CardDescription>Suivez la progression de vos dépenses par rapport à vos budgets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {filteredBudgets.length > 0 ? (
                      filteredBudgets.map((budget) => (
                        <div key={budget.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{budget.description || getCategoryLabel(budget.category)}</div>
                            <div className="text-sm text-muted-foreground">
                              {budget.spent ?? 0} € / {budget.amount} €
                            </div>
                          </div>
                          <Progress
                            value={(((budget.spent ?? 0) / budget.amount) * 100)}
                            className={`h-2 ${(budget.spent ?? 0) > budget.amount ? "bg-red-200" : "bg-gray-200"}`}
                            style={{
                              "--progress-indicator-color": (budget.spent ?? 0) > budget.amount ? "#ef4444" : "#3b82f6",
                            } as React.CSSProperties}
                          />
                          <div className="text-xs text-right text-muted-foreground">
                            {Math.round(((budget.spent ?? 0) / budget.amount) * 100)}% utilisé
                            {(budget.spent ?? 0) > budget.amount && (
                              <span className="text-red-500 ml-2">
                                (Dépassé de {((budget.spent ?? 0) - budget.amount).toFixed(2)} €)
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>Aucun budget enregistré</p>
                        <p className="text-sm mt-2">Ajoutez un budget pour suivre vos dépenses</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tous les budgets</CardTitle>
                  <CardDescription>Liste complète de vos budgets</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionList transactions={filteredBudgets} type="budget" onDelete={handleDeleteBudget} />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      <style jsx>{`
        .progress-bar > div {
          background-color: var(--progress-indicator-color, #3b82f6);
        }
      `}</style>
    </div>
  );
}