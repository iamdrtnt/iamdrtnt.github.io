import { getCollection, type CollectionEntry } from "astro:content";
export async function articles() {
  return (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) =>
      b.data.date.valueOf() - a.data.date.valueOf() || a.id.localeCompare(b.id),
  );
}
export const readingTime = (post: CollectionEntry<"blog">) =>
  Math.max(1, Math.ceil((post.body || "").trim().split(/\s+/).length / 200));
export const dateLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
export const articleUrl = (id: string) => "/blog/" + id + "/";
