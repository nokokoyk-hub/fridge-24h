export const CATEGORIES = [
  "野菜",
  "肉・魚",
  "乳製品",
  "卵",
  "飲み物",
  "作り置き",
  "その他",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type FoodItem = {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: string;
  expiresOn: string;
  addedAt: string;
};

export type Urgency = "expired" | "today" | "soon" | "safe";
