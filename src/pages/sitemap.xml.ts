import type { APIRoute } from "astro";
import { articles, articleUrl } from "../lib/articles";
import { navigation } from "../data/profile";
export const GET: APIRoute = async ({ site }) => {
  const urls = [
    ...navigation.map(([, path]) => path),
    ...(await articles()).map((p) => articleUrl(p.id)),
  ];
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      urls
        .map((p) => "<url><loc>" + new URL(p, site).href + "</loc></url>")
        .join("") +
      "</urlset>",
    { headers: { "Content-Type": "application/xml" } },
  );
};
