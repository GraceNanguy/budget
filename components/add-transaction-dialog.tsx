"use client";

import { useState } from "react";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type TransactionType = "expense" | "income" | "budget";

interface Category {
  value: string;
  label: string;
}

interface AddTransactionDialogProps {
  type: TransactionType;
  onAdd: (data: any) => void;
  trigger: React.ReactNode;
}

export function AddTransactionDialog({ type, onAdd, trigger }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(""); // "" par défaut
  const [recurring, setRecurring] = useState(false);
  const [recurringPeriod, setRecurringPeriod] = useState<string>("monthly");
  const [openCategorySelect, setOpenCategorySelect] = useState(false);

  const categories: Category[] =
    type === "income"
      ? [
          { value: "salary", label: "Salaire" },
          { value: "freelance", label: "Freelance" },
          { value: "investment", label: "Investissement" },
          { value: "gift", label: "Cadeau" },
          { value: "other", label: "Autre" },
        ]
      : [
          { value: "food", label: "Alimentation" },
          { value: "transport", label: "Transport" },
          { value: "housing", label: "Logement" },
          { value: "utilities", label: "Factures" },
          { value: "entertainment", label: "Divertissement" },
          { value: "health", label: "Santé" },
          { value: "education", label: "Éducation" },
          { value: "shopping", label: "Shopping" },
          { value: "other", label: "Autre" },
        ];

  const recurringPeriods = [
    { value: "daily", label: "Quotidien" },
    { value: "weekly", label: "Hebdomadaire" },
    { value: "monthly", label: "Mensuel" },
    { value: "yearly", label: "Annuel" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      type,
      date,
      amount: Number.parseFloat(amount),
      description,
      category: category || "other", // Transforme "" en "other"
      recurring,
      recurringPeriod: recurring ? recurringPeriod : undefined,
    };

    onAdd(data);

    setDate(new Date());
    setAmount("");
    setDescription("");
    setCategory("");
    setRecurring(false);
    setRecurringPeriod("monthly");
    setOpen(false);
  };

  const getTitle = () => {
    switch (type) {
      case "expense":
        return "Ajouter une dépense";
      case "income":
        return "Ajouter un revenu";
      case "budget":
        return "Créer un budget";
      default:
        return "Ajouter";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="transaction-dialog-description">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{getTitle()}</DialogTitle>
            <DialogDescription>
              {type === "budget"
                ? "Définissez un budget pour une catégorie spécifique."
                : "Ajoutez les détails de votre transaction."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Montant
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-16"
                  placeholder="0"
                  required
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">FCFA</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Catégorie
              </Label>
              <div className="col-span-3">
                <Popover open={openCategorySelect} onOpenChange={setOpenCategorySelect}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCategorySelect}
                      className="w-full justify-between"
                    >
                      {category
                        ? categories.find((cat) => cat.value === category)?.label
                        : "Sélectionner une catégorie"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Rechercher une catégorie..." />
                      <CommandList>
                        <CommandEmpty>Aucune catégorie trouvée.</CommandEmpty>
                        <CommandGroup>
                          {categories.map((cat) => (
                            <CommandItem
                              key={cat.value}
                              value={cat.value}
                              onSelect={(currentValue) => {
                                setCategory(currentValue);
                                setOpenCategorySelect(false);
                              }}
                            >
                              <Check
                                className={cn("mr-2 h-4 w-4", category === cat.value ? "opacity-100" : "opacity-0")}
                              />
                              {cat.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder={type === "budget" ? "Budget mensuel pour..." : "Description..."}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recurring" className="text-right">
                Récurrent
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Checkbox id="recurring" checked={recurring} onCheckedChange={(checked) => setRecurring(!!checked)} />
                <Label htmlFor="recurring" className="text-sm">
                  Transaction récurrente
                </Label>
              </div>
            </div>
            {recurring && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recurringPeriod" className="text-right">
                  Période
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {recurringPeriods.find((period) => period.value === recurringPeriod)?.label || "Mensuel"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            {recurringPeriods.map((period) => (
                              <CommandItem
                                key={period.value}
                                value={period.value}
                                onSelect={(value) => setRecurringPeriod(value)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    recurringPeriod === period.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {period.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Ajouter</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}