# Journal editorial and publishing guide

> Write an SEO-optimised Journal article about AI in primary care and open a PR for review.

Treat a request like this as a complete article package. Research the question, write and verify the English and Persian articles, prepare one cover for the pair, and open one pull request against `main`. Start from the latest `main` on a fresh review branch. The owner approves publication by merging the PR.

## Choose the angle and metadata

- Choose one question a reader actually needs answered. Narrow a broad topic to a practical decision or point of uncertainty. Check the Journal for overlapping coverage and add a relevant internal link when it helps the reader.
- Write a specific, accurate English title that uses the topic’s natural search terms. Use the filename as the default public slug. Choose a short, descriptive, lowercase English slug with hyphens, such as `evaluating-ai-in-primary-care`. Use the same slug in both collections. Check that it is unique within each collection. If you use Astro’s optional `slug` override, set the same value in both files. Preserve public slugs and existing heading anchors when editing a published article.
- Write a one- or two-sentence `description` as the editorial dek. It appears below the headline, in article lists, and in RSS. Set `seoTitle` and `seoDescription` separately in English and Persian. The site appends the author’s name to the page title and uses the resulting title and description for search and social previews. A meta description around 140–160 characters is a useful target when it fits the subject.
- Pick one category from [the category list](../src/data/categories.ts). Use a few specific tags and reuse an existing tag spelling when it describes the same topic. File healthcare AI under **Artificial Intelligence** when model evaluation or use is the main subject. Classify operations and service delivery under **Healthcare Management** when those are the focus.

## Write the article

Write in natural, professional English with Canadian spelling. The Journal is by Mohammadreza Norouzi, an International Medical Graduate working across research and healthcare innovation. Use [the approved profile](../src/data/profile.ts) for biographical facts and affiliations. Keep invented patient scenarios explicitly hypothetical and avoid attributing invented personal or clinical experiences to the author.

Open with the practical question and give the reader an early answer or useful frame. Use plain language, explain necessary technical terms, and give each section a descriptive H2. Use H3 headings within a section as needed. The layout supplies the H1 from frontmatter and builds a contents list from three or more H2 headings. Use optional `takeaways` for two to four concise points when the topic warrants it. End with a clearly headed conclusion that answers the opening question and reflects the strength and limits of the evidence. Add further reading when it helps the reader trace the claims.

Check the actual sources and link to them with descriptive text. For clinical and healthcare AI claims, cite relevant primary studies, systematic reviews, clinical guidance, or reporting standards as appropriate. Name the setting, population, or timeframe when the evidence depends on it. Distinguish findings, hypotheses, and opinion. Use keywords naturally and remove passages that would add little beyond what a reader already knows.

## Localise the article for Persian readers

Start from the final, fact-checked English manuscript. Translate the complete body, title, dek, headings, takeaways, tags, cover alt text, and any caption. Write natural Persian for a scientific audience. Retain technical acronyms and official source identifiers where readers need them. Isolate mixed-direction acronyms and visible identifiers with `<bdi dir="ltr">` where needed.

Keep the same publication date, public slug, and category key in both files. The site translates category keys for display and formats dates and reading time for the page language. Use Persian tag values. Preserve source URLs, reference order, and the strength and scope of each scientific claim. Link to Persian counterparts for internal references where available. Keep equivalent headings in the same order and at the same depth so readers can switch languages from the section they are reading.

## Prepare the cover

Use one distinct scientific concept rendered as a tactile editorial still life. The three launch covers show a caliper for trial comparisons, an optical lens for narrowing a question, and a chip crossing two surfaces for external validation. Use deep graphite and charcoal, with soft steel-blue edge light, small silver highlights, and readable shadow detail. Compose with generous negative space. Keep the subject within the centre of the frame so it remains legible in a square mobile thumbnail as well as in the wide hero and social crop.

Adapt this image-generation prompt to the article.

> Wide photographic still life for a medical research journal. Show [one subject embodying the article’s central concept] against a charcoal laboratory surface. Use believable materials, restrained steel-blue edge lighting, silver highlights, and soft shadow detail. Keep the composition spare and the subject near the centre for a square crop. No lettering, logos, people, or borders.

Generate original art or use an owner-approved asset with permission for web publication. Check the actual crop, image quality, and any required credit. Export a 16:9 WebP at 1440 × 810 where practical and aim for under 150 KB. Save it as `public/images/journal/<slug>.webp`. Use the matching `/images/journal/<slug>.webp` in `coverImage.src`, record its actual dimensions, and write localised alt text in each manuscript that describes the visible subject and composition. Put any visible credit or necessary context in the optional `coverImage.caption`. Reuse the same cover across both languages, Journal listings, article pages, and social previews.

## Prepare the PR

1. Copy the [English template](../templates/article.md) to `src/content/blog/<slug>.md` and the [Persian template](../templates/article.fa.md) to `src/content/blog-fa/<slug>.md`. Set the intended release date in both files. Keep both as drafts until the pair is ready for review. Dates are metadata. Publishing occurs when the approved change is merged and deployed.
2. Use the same featured setting for each pair. To change the lead, update the flags in both collections. The newest published article is the fallback when a locale has no featured post. Set `readingTime` only when the automatic estimate is unsuitable.
3. With Node 24, run `npm ci`, `npm run build`, and `npm test`. Preview both Journal indexes and article pages at desktop and mobile widths in light and dark themes. Check the filter, cover crops, headings, references, adjacent articles, copy feedback, and language switching from a heading fragment.
4. Confirm each article has a self-canonical, reciprocal `en-CA` and `fa-IR` alternates, localised social previews, and structured data. Check that each live article is in the sitemap and the feed for its language (`/rss.xml` or `/fa/rss.xml`). Drafts are excluded from output. Alternate metadata is generated only when the matching published article exists, and regression tests require a pair for each published article.
5. Push the review branch and open one PR against `main`. Include both URLs, a brief summary, evidence sources, how the cover was prepared, and validation results. Share the PR link for owner review.
