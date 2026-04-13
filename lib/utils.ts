import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format credits as readable string */
export function formatCredits(credits: number): string {
  return credits.toLocaleString("ro-RO") + " credite";
}

/** Convert credits to EUR (100 credits = 3€ for withdrawal) */
export function creditsToEur(credits: number): number {
  return (credits / 100) * 3;
}

/** Convert EUR to credits (100 credits = 5€ for purchase) */
export function eurToCredits(eur: number): number {
  return Math.floor((eur / 5) * 100);
}

/** Format date in Romanian locale */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format relative time */
export function timeAgo(date: Date | string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return "Acum câteva secunde";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Acum ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Acum ${hours} ore`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Acum ${days} zile`;
  return formatDate(date);
}

/** Get initials from name */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Truncate text */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/** Credit purchase packages */
export const CREDIT_PACKAGES = [
  { credits: 100, price: 5, label: "Starter" },
  { credits: 500, price: 20, label: "Pro", popular: true },
  { credits: 1000, price: 35, label: "Elite" },
] as const;

/** Platform commission rate */
export const PLATFORM_COMMISSION = 0.15;

/** Minimum credits for withdrawal */
export const MIN_WITHDRAWAL_CREDITS = 500;

/** Material categories */
export const MATERIAL_CATEGORIES = [
  "Matematică",
  "Informatică",
  "Fizică",
  "Chimie",
  "Biologie",
  "Medicină",
  "Drept",
  "Economie",
  "Inginerie",
  "Arhitectură",
  "Psihologie",
  "Filosofie",
  "Limbi Străine",
  "Istorie",
  "Geografie",
  "Altele",
] as const;

/** Job domains */
export const JOB_DOMAINS = [
  "IT & Software",
  "Finance & Banking",
  "Marketing & PR",
  "Engineering",
  "Medicine & Pharma",
  "Law",
  "Education",
  "Design & Creative",
  "Sales",
  "HR",
  "Logistics",
  "Other",
] as const;
