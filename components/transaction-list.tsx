"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  MoreVertical,
  ShoppingCart,
  Bus,
  Home,
  Lightbulb,
  Film,
  Heart,
  GraduationCap,
  ShoppingBag,
  HelpCircle,
  Briefcase,
  Code,
  TrendingUp,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/lib/types"; // Import depuis lib/types.ts
import { ensureValidDate, formatAmount } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
  type: "expense" | "income" | "budget";
  limit?: number;
  onDelete?: (id: string) => void;
}

export function TransactionList({ transactions, type, limit, onDelete }: TransactionListProps) {
  const filteredTransactions = transactions
    .filter((t) => t.type === type)
    .sort((a, b) => {
      const dateA = ensureValidDate(a.date).getTime();
      const dateB = ensureValidDate(b.date).getTime();
      return dateB - dateA; // Tri décroissant
    })
    .slice(0, limit || transactions.length);

  const getCategoryLabel = (category?: string | null | undefined) => {
    if (!category) return "Sans catégorie";
    const categories = {
      salary: "Salaire",
      freelance: "Freelance",
      investment: "Investissement",
      gift: "Cadeau",
      other: "Autre",
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

  const getCategoryIcon = (category?: string | null | undefined) => {
    if (!category) return <HelpCircle className="h-4 w-4" />;
    const icons = {
      salary: <Briefcase className="h-4 w-4" />,
      freelance: <Code className="h-4 w-4" />,
      investment: <TrendingUp className="h-4 w-4" />,
      gift: <Gift className="h-4 w-4" />,
      other: <HelpCircle className="h-4 w-4" />,
      food: <ShoppingCart className="h-4 w-4" />,
      transport: <Bus className="h-4 w-4" />,
      housing: <Home className="h-4 w-4" />,
      utilities: <Lightbulb className="h-4 w-4" />,
      entertainment: <Film className="h-4 w-4" />,
      health: <Heart className="h-4 w-4" />,
      education: <GraduationCap className="h-4 w-4" />,
      shopping: <ShoppingBag className="h-4 w-4" />,
    };
    return icons[category as keyof typeof icons] || <HelpCircle className="h-4 w-4" />;
  };

  const getIcon = () => {
    switch (type) {
      case "expense":
        return <ArrowDownCircle className="h-5 w-5 text-blue-500" />;
      case "income":
        return <ArrowUpCircle className="h-5 w-5 text-green-500" />;
      case "budget":
        return <Wallet className="h-5 w-5 text-primary" />;
    }
  };

  if (filteredTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>
          Aucun{" "}
          {type === "expense" ? "dépense" : type === "income" ? "revenu" : "budget"}{" "}
          enregistré
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredTransactions.map((transaction) => {
        const validDate = ensureValidDate(transaction.date);

        return (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <div className="flex items-center gap-3">
              {getIcon()}
              <div>
                <p className="font-medium">
                  {transaction.description || getCategoryLabel(transaction.category)}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{format(validDate, "d MMM yyyy", { locale: fr })}</span>
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    {getCategoryIcon(transaction.category)}
                    {getCategoryLabel(transaction.category)}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`font-semibold ${
                  type === "expense"
                    ? "text-blue-500"
                    : type === "income"
                    ? "text-green-500"
                    : ""
                }`}
              >
                {type === "expense" ? "-" : type === "income" ? "+" : ""}
                {formatAmount(transaction.amount)}
              </span>
              {onDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDelete(transaction.id)}>
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}