# Working on this portfolio

- Keep the original English routes, slugs, and content stable. Use Canadian English at the root and natural Persian under `/fa/`, including accessible names, image descriptions, and SEO metadata. Preserve the exact names Mohammadreza Norouzi and محمدرضا نوروزی.
- Treat `src/data/profile.ts` as the source of approved professional facts. Keep previous practice in Iran and the British Columbia licensure disclosure explicit. Publish only verified credentials, publications, affiliations, contact details, and owner-approved public files.
- Follow [the Journal editorial and publishing guide](docs/journal.md) for every request to write, add, or publish a blog post. Create article pairs in the English and Persian Astro Markdown collections. Follow `docs/journal.md`. Set real dates, check sources and links, and keep drafts out of routes, RSS, and the sitemap. Label any demonstration material and keep it in draft.
- Use static HTML first. Preserve keyboard navigation, reduced motion, system theme fallback, and GitHub Pages root paths. Keep tracking and third-party scripts out.
- Use Node 24, run `npm ci`, `npm run build`, and `npm test`. Inspect changed layouts on mobile and desktop in both themes.
- Work on a review branch. Open a PR against main. Only the owner’s approved merge should publish to Pages. Do not deploy, change production settings, or add a CNAME without approval.
