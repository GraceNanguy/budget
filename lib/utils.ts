// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ensureValidDate = (dateInput: any): Date => {
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput;
  }
  if (typeof dateInput === "number") {
    return new Date(dateInput);
  }
  if (dateInput && typeof dateInput.toDate === "function") {
    return dateInput.toDate();
  }
  if (typeof dateInput === "string") {
    const parsedDate = new Date(dateInput);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }
  console.warn("Date invalide détectée, utilisation de la date actuelle comme fallback", dateInput);
  return new Date();
};

export const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("fr-CI", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);
};