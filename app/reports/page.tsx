"use client";

import { MainNav } from "@/components/main-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

// Mock data
const budgetData = [
  { category: "Alimentation", budget: 500, spent: 400, color: "blue-500" },
  { category: "Transport", budget: 200, spent: 180, color: "green-500" },
  { category: "Logement", budget: 800, spent: 800, color: "yellow-500" },
  { category: "Divertissement", budget: 300, spent: 350, color: "red-500" },
  { category: "Factures", budget: 400, spent: 380, color: "purple-500" },
];

export default function ReportsPage() {
  const [month, setMonth] = useState("february");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MainNav notificationCount={2} />
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-4 md:gap-8 max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Rapports</h1>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sélectionner un mois" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="february">Février 2025</SelectItem>
                <SelectItem value="march">Mars 2025</SelectItem>
                <SelectItem value="april">Avril 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="budget" className="w-full">
            <TabsList>
              <TabsTrigger value="budget">Suivi des budgets</TabsTrigger>
              <TabsTrigger value="summary">Résumé mensuel</TabsTrigger>
            </TabsList>
            <TabsContent value="budget" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Progression des budgets</CardTitle>
                  <CardDescription>Suivez la progression de vos dépenses par rapport à vos budgets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {budgetData.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{item.category}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.spent} € / {item.budget} €
                          </div>
                        </div>
                        <Progress
                          value={(item.spent / item.budget) * 100}
                          className={`h-2 ${item.spent > item.budget ? "bg-red-200" : "bg-gray-200"}`}
                          style={{
                            "--progress-indicator-color": item.spent > item.budget ? "#ef4444" : item.color,
                          } as React.CSSProperties}
                        />
                        <div className="text-xs text-right text-muted-foreground">
                          {Math.round((item.spent / item.budget) * 100)}% utilisé
                          {item.spent > item.budget && (
                            <span className="text-red-500 ml-2">
                              (Dépassé de {item.spent - item.budget} €)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="summary" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Résumé du mois</CardTitle>
                  <CardDescription>Aperçu global de vos finances pour le mois sélectionné</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Revenus</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Salaire</span>
                          <span className="font-medium">2500 €</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Freelance</span>
                          <span className="font-medium">500 €</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Investissements</span>
                          <span className="font-medium">200 €</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="font-semibold">Total</span>
                          <span className="font-semibold text-green-500">3200 €</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Dépenses</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Alimentation</span>
                          <span className="font-medium">400 €</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transport</span>
                          <span className="font-medium">180 €</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Logement</span>
                          <span className="font-medium">800 €</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Divertissement</span>
                          <span className="font-medium">350 €</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Factures</span>
                          <span className="font-medium">380 €</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="font-semibold">Total</span>
                          <span className="font-semibold text-red-500">2110 €</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Solde du mois</span>
                      <span className="font-bold text-xl text-green-500">+1090 €</span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Vous avez économisé 34% de vos revenus ce mois-ci.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* CSS personnalisé pour la barre de progression */}
      <style jsx>{`
        .progress-bar > div {
          background-color: var(--progress-indicator-color, #3b82f6);
        }
      `}</style>
    </div>
  );
}