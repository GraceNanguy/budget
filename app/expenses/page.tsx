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
import { auth, db } from "@/lib/firebase";
import { collection, query, where, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ensureValidDate, formatAmount } from "@/lib/utils";

export default function ExpensesPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
          const transactionsRef = collection(db, "transactions");
          const q = query(transactionsRef, where("userId", "==", user.uid), where("type", "==", "expense"));

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
                  date: data.date,
                  description: data.description || "",
                  category: data.category ?? null,
                  spent: data.spent ?? null,
                  updatedAt: data.updatedAt ?? null,
                  recurring: data.recurring ?? false,
                  recurringPeriod: data.recurringPeriod ?? null,
                } as Transaction;
              });

              setTransactions(transactionsData);
              setIsLoading(false);
            },
            (error) => {
              console.error("Erreur lors de la récupération des transactions :", error);
              setIsLoading(false);
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

  const handleAddTransaction = async (data: Partial<Transaction>) => {
    if (!auth.currentUser) {
      router.push("/auth");
      return;
    }

    try {
      console.log("Données reçues dans handleAddTransaction (expenses):", data);
      const date = ensureValidDate(data.date).getTime();
      const transactionData = {
        type: "expense" as const,
        amount: Number(data.amount) || 0,
        userId: auth.currentUser.uid,
        createdAt: Date.now(),
        date,
        description: data.description || "",
        category: data.category ?? null,
        spent: data.spent ?? null,
        updatedAt: Date.now(),
        recurring: data.recurring ?? false,
        recurringPeriod: data.recurring ?? data.recurringPeriod ?? null,
      };
      console.log("Données envoyées à Firestore (expenses):", transactionData);
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

  const filteredTransactions = transactions.filter(
    (t) =>
      (t.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (t.category?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const totalExpenses = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

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
              <h1 className="text-2xl font-bold">Dépenses</h1>
              <p className="text-muted-foreground">Gérez et suivez toutes vos dépenses</p>
            </div>
            <AddTransactionDialog
              type="expense"
              onAdd={handleAddTransaction}
              trigger={
                <Button className="gap-1">
                  <Plus className="h-4 w-4" />
                  Nouvelle dépense
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
              Total: <span className="font-semibold text-blue-500">{formatAmount(totalExpenses)}</span>
            </div>
          </div>

          {isLoading ? (
            <div className="h-24 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Toutes les dépenses</CardTitle>
                <CardDescription>Liste complète de vos dépenses</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionList
                  transactions={filteredTransactions}
                  type="expense"
                  onDelete={handleDeleteTransaction}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}