import { articles, articleUrl } from "./articles";
import { categoryLabel } from "../i18n/categories";
import { localPath, locales, translator, type Locale } from "../i18n/locales";
import { profileFor } from "../i18n/profile";

const escape = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

export async function journalFeed(site: URL, locale: Locale) {
  const t = translator(locale);
  const title = profileFor(locale).name + " | " + t("Journal", "مجله");
  const link = new URL(localPath("/blog/", locale), site).href;
  const description = t(
    "Articles on clinical research, medicine, and healthcare technology.",
    "مقاله‌هایی دربارهٔ پژوهش بالینی، پزشکی و فناوری سلامت.",
  );
  const items = (await articles(locale)).map(({ id, data }) => {
    const url = new URL(articleUrl(id, locale), site).href;
    return `<item><title>${escape(data.title)}</title><link>${url}</link><guid>${url}</guid><description>${escape(data.description)}</description><pubDate>${data.publishDate.toUTCString()}</pubDate><category>${escape(categoryLabel(data.category, locale))}</category></item>`;
  });
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escape(title)}</title><link>${link}</link><description>${escape(description)}</description><language>${locales[locale].lang.toLowerCase()}</language>${items.join("")}</channel></rss>`,
    { headers: { "Content-Type": "application/rss+xml" } },
  );
}
