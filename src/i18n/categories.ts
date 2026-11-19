import type { categories } from "../data/categories";
import type { Locale } from "./locales";

const persian = {
  "Clinical Medicine": "پزشکی بالینی",
  "Medical Research": "پژوهش پزشکی",
  "Artificial Intelligence": "هوش مصنوعی",
  "Neuroscience": "علوم اعصاب",
  "Healthcare Innovation": "نوآوری در سلامت",
  "Healthcare Management": "مدیریت سلامت",
  "Personal Insights": "دیدگاه شخصی",
} satisfies Record<(typeof categories)[number], string>;

export function categoryLabel(category: keyof typeof persian, locale: Locale): string {
  return locale === "fa" ? persian[category] : category;
}
