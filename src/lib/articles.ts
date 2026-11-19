import { getCollection, type CollectionEntry } from "astro:content";
import { localPath, locales, numberLabel, type Locale } from "../i18n/locales";

export type Article = CollectionEntry<"blog"> | CollectionEntry<"blogFa">;

export async function articles(locale: Locale = "en"): Promise<Article[]> {
  return (await getCollection(locale === "fa" ? "blogFa" : "blog", ({ data }) => !data.draft)).sort(
    (a, b) =>
      b.data.publishDate.valueOf() - a.data.publishDate.valueOf() ||
      a.id.localeCompare(b.id),
  );
}

export async function articlePaths(locale: Locale) {
  const posts = await articles(locale);
  const translations = new Map((await articles(locale === "fa" ? "en" : "fa")).map(
    (post) => [post.id, post],
  ));
  return posts.map((post, index) => ({
    params: { id: post.id },
    props: { post, posts, index, translation: translations.get(post.id) },
  }));
}

export const readingTime = (post: Article) =>
  post.data.readingTime ??
  Math.max(1, Math.ceil((post.body || "").trim().split(/\s+/).length / 200));

export function readingLabel(post: Article, locale: Locale) {
  const minutes = numberLabel(readingTime(post), locale);
  return locale === "fa" ? `${minutes} دقیقه مطالعه` : `${minutes} min read`;
}

export function dateLabel(date: Date, locale: Locale = "en") {
  return new Intl.DateTimeFormat(locales[locale].lang, {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export const articleUrl = (id: string, locale: Locale = "en") => localPath("/blog/" + id + "/", locale);
