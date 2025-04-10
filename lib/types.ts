// lib/types.ts
export interface Transaction {
  id: string;
  type: "expense" | "income" | "budget";
  amount: number;
  description: string;
  category?: string | null;
  date: number; // Timestamp
  userId: string;
  createdAt: number;
  spent?: number | null;
  updatedAt?: number | null;
  recurring?: boolean;
  recurringPeriod?: string | null;
}