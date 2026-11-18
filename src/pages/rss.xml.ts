import type { APIRoute } from "astro";
import { articles, articleUrl } from "../lib/articles";
import { profile } from "../data/profile";
const escape = (v: string) =>
  v
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
export const GET: APIRoute = async ({ site }) => {
  const items = (await articles()).map((post) => {
    const url = new URL(articleUrl(post.id), site).href;
    return `<item><title>${escape(post.data.title)}</title><link>${url}</link><guid>${url}</guid><description>${escape(post.data.description)}</description><pubDate>${post.data.date.toUTCString()}</pubDate><category>${escape(post.data.category)}</category></item>`;
  });
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${profile.name} | Research notebook</title><link>${new URL("/blog/", site).href}</link><description>Articles on clinical research, medicine, and healthcare technology.</description><language>en-ca</language>${items.join("")}</channel></rss>`,
    { headers: { "Content-Type": "application/rss+xml" } },
  );
};
