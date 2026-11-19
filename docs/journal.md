# Journal editorial and publishing guide

> Write an SEO-optimised Journal article about AI in primary care and open a PR for review.

Treat a request like this as a complete article package. Research the question, write the post, prepare a matching cover, verify the local site, and open a pull request against `main`. Start from the latest `main` on a fresh review branch. The owner approves publication by merging the PR.

## Choose the angle and metadata

- Choose one question a reader actually needs answered. Narrow a broad topic to a practical decision or point of uncertainty. Check the Journal for overlapping coverage and add a relevant internal link when it helps the reader.
- Write a specific, accurate English title that uses the topic’s natural search terms. Use the filename as the default public slug. Choose a short, descriptive, lowercase English slug with hyphens, such as `evaluating-ai-in-primary-care`. Check that it is unique across published posts and drafts. Astro accepts an optional `slug` override. Preserve existing public slugs and headings when editing a published article.
- Write a one- or two-sentence `description` as the editorial dek. It appears below the headline, in article lists, and in RSS. Use optional `seoTitle` and `seoDescription` when search needs more explicit wording. The site appends the author’s name to the page title and uses the resulting title and description for search and social previews. A meta description around 140–160 characters is a useful target when it fits the subject.
- Pick one category from [the category list](../src/data/categories.ts). Use a few specific tags and reuse an existing tag spelling when it describes the same topic. File healthcare AI under **Artificial Intelligence** when model evaluation or use is the main subject. Classify operations and service delivery under **Healthcare Management** when those are the focus.

## Write the article

Write in natural, professional English with Canadian spelling. The Journal is by Mohammadreza Norouzi, an International Medical Graduate working across research and healthcare innovation. Use [the approved profile](../src/data/profile.ts) for biographical facts and affiliations. Keep invented patient scenarios explicitly hypothetical and avoid attributing invented personal or clinical experiences to the author.

Open with the practical question and give the reader an early answer or useful frame. Use plain language, explain necessary technical terms, and give each section a descriptive H2. Use H3 headings within a section as needed. The layout supplies the H1 from frontmatter and builds a contents list from three or more H2 headings. Use optional `takeaways` for two to four concise points when the topic warrants it. End with a clearly headed conclusion that answers the opening question and reflects the strength and limits of the evidence. Add further reading when it helps the reader trace the claims.

Check the actual sources and link to them with descriptive text. For clinical and healthcare AI claims, cite relevant primary studies, systematic reviews, clinical guidance, or reporting standards as appropriate. Name the setting, population, or timeframe when the evidence depends on it. Distinguish findings, hypotheses, and opinion. Use keywords naturally and remove passages that would add little beyond what a reader already knows.

## Prepare the cover

Use one distinct scientific concept rendered as a tactile editorial still life. The three launch covers show a caliper for trial comparisons, an optical lens for narrowing a question, and a chip crossing two surfaces for external validation. Use deep graphite and charcoal, with soft steel-blue edge light, small silver highlights, and readable shadow detail. Compose with generous negative space. Keep the subject within the centre of the frame so it remains legible in a square mobile thumbnail as well as in the wide hero and social crop.

Adapt this image-generation prompt to the article.

> Wide photographic still life for a medical research journal. Show [one subject embodying the article’s central concept] against a charcoal laboratory surface. Use believable materials, restrained steel-blue edge lighting, silver highlights, and soft shadow detail. Keep the composition spare and the subject near the centre for a square crop. No lettering, logos, people, or borders.

Generate original art or use an owner-approved asset with permission for web publication. Check the actual crop, image quality, and any required credit. Export a 16:9 WebP at 1440 × 810 where practical and aim for under 150 KB. Save it as `public/images/journal/<slug>.webp`. Use the matching `/images/journal/<slug>.webp` in `coverImage.src`, record its actual dimensions, and write English alt text that describes the visible subject and composition. Put any visible credit or necessary context in the optional `coverImage.caption`. Reuse the same cover across the Journal listing, article, and social previews.

## Prepare the PR

1. Copy [the article template](../templates/article.md) to `src/content/blog/<slug>.md`. Fill in the metadata and body. Use the intended release date in `publishDate`. Keep `draft: true` while writing and for articles awaiting a future release. Set it to `false` when the article is ready to publish on approval. Set `readingTime` only when the automatic estimate is unsuitable.
2. Leave `featured: false` for an ordinary post. To change the lead, mark the intended post and clear the previous feature flag. The newest published post is the fallback if no lead is selected. The Journal archive, topic filters, feeds, structured data, and adjacent article links derive from the collection.
3. With Node 24, run `npm ci`, `npm run build`, and `npm test`. Preview the Journal and the new article at desktop and mobile sizes in both themes. Check the category filter, cover crops, headings, article links, canonical URL, search description, and social image. Confirm the production build includes the post in both RSS and the sitemap when `draft: false`. Drafts are excluded from the built site. A date is metadata and does not schedule a future deployment.
4. Push the review branch and open a PR against `main`. Include the article URL, a brief summary, the main evidence sources, how the cover was prepared, and validation results. Share the PR link and leave the merge and Pages publication to the owner.
