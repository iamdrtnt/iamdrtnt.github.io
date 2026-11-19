import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { categories } from "./data/categories";

const cover = z.object({
  src: z.string().startsWith("/images/"),
  alt: z.string().trim().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  caption: z.string().optional(),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z
    .object({
      title: z.string().trim().min(1),
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
      description: z.string().trim().min(1),
      publishDate: z.coerce.date().optional(),
      date: z.coerce.date().optional(),
      category: z.enum(categories),
      tags: z.array(z.string()).default([]),
      coverImage: cover.optional(),
      image: cover.extend({ src: z.string() }).optional(),
      featured: z.boolean().default(false),
      seoTitle: z.string().trim().min(1).optional(),
      seoDescription: z.string().trim().min(1).optional(),
      draft: z.boolean().default(false),
      readingTime: z.number().int().positive().optional(),
      takeaways: z.array(z.string().trim().min(1)).default([]),
    })
    .transform(({ date, publishDate = date, image, coverImage = image, ...data }, ctx) => {
      if (!publishDate) {
        ctx.issues.push({
          code: "custom",
          path: ["publishDate"],
          message: "Enter the article’s publication date.",
          input: publishDate,
        });
        return z.NEVER;
      }
      return { ...data, publishDate, coverImage };
    }),
});
export const collections = { blog };
