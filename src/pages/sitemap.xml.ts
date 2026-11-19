import type { APIRoute } from "astro";
import { articles, articleUrl } from "../lib/articles";
import { navigationFor } from "../i18n/profile";
import type { Locale } from "../i18n/locales";
export const GET: APIRoute = async ({ site }) => {
  const languages: Locale[] = ["en", "fa"];
  const urls = (await Promise.all(languages.map(async (locale) => [
    ...navigationFor(locale).map(({ href }) => href),
    ...(await articles(locale)).map(({ id }) => articleUrl(id, locale)),
  ]))).flat();
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      urls
        .map((p) => "<url><loc>" + new URL(p, site).href + "</loc></url>")
        .join("") +
      "</urlset>",
    { headers: { "Content-Type": "application/xml" } },
  );
};
