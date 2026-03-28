import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function nanoid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function formatDate(iso: string, locale: string = "en"): string {
  return new Date(iso).toLocaleDateString(locale === "de" ? "de-DE" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatCurrency(amount: number, locale: string = "en"): string {
  return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}
