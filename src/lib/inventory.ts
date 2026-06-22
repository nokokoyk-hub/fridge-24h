import type { FoodItem, Urgency } from "@/types/food";

const DAY_MS = 86_400_000;

export function toLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysKey(offset: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return toLocalDateKey(date);
}

export function daysUntil(dateKey: string) {
  const today = new Date(`${toLocalDateKey()}T12:00:00`);
  const target = new Date(`${dateKey}T12:00:00`);
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

export function getUrgency(item: FoodItem): Urgency {
  const days = daysUntil(item.expiresOn);
  if (days < 0) return "expired";
  if (days === 0) return "today";
  if (days <= 3) return "soon";
  return "safe";
}

export function urgencyLabel(item: FoodItem) {
  const days = daysUntil(item.expiresOn);
  if (days < 0) return `${Math.abs(days)}日超過`;
  if (days === 0) return "本日まで";
  if (days === 1) return "残り1日";
  return `残り${days}日`;
}

export function createDemoItems(): FoodItem[] {
  const now = new Date().toISOString();
  return [
    {
      id: crypto.randomUUID(),
      name: "木綿豆腐",
      category: "その他",
      quantity: 1,
      unit: "丁",
      expiresOn: addDaysKey(0),
      addedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: "牛乳",
      category: "乳製品",
      quantity: 1,
      unit: "本",
      expiresOn: addDaysKey(2),
      addedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: "たまご",
      category: "卵",
      quantity: 6,
      unit: "個",
      expiresOn: addDaysKey(6),
      addedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: "にんじん",
      category: "野菜",
      quantity: 2,
      unit: "本",
      expiresOn: addDaysKey(9),
      addedAt: now,
    },
  ];
}
