export type Locale = "en" | "fa";

export const locales = {
  en: { lang: "en-CA", dir: "ltr", og: "en_CA" },
  fa: { lang: "fa-IR", dir: "rtl", og: "fa_IR" },
} as const;

export function localeFromPath(path: string): Locale {
  return path === "/fa" || path.startsWith("/fa/") ? "fa" : "en";
}

/** Localise an English site route while keeping its fragment intact. */
export function localPath(path: string, locale: Locale): string {
  return locale === "fa" && path.startsWith("/") && !path.startsWith("//")
    ? "/fa" + path
    : path;
}

export function englishPath(path: string): string {
  return localeFromPath(path) === "fa" ? path.slice(3) || "/" : path;
}

export function translator(locale: Locale) {
  return (en: string, fa: string): string => locale === "fa" ? fa : en;
}

export function numberLabel(value: number, locale: Locale, minimumIntegerDigits = 1): string {
  return new Intl.NumberFormat(locales[locale].lang, {
    minimumIntegerDigits,
    useGrouping: false,
  }).format(value);
}
