# Mohammadreza Norouzi’s academic portfolio

English-language personal website for Mohammadreza Norouzi, a medical graduate based in Vancouver, British Columbia, Canada. The production address is [iamdrtnt.github.io](https://iamdrtnt.github.io/).

## Run and preview

Use Node.js 24 and npm. From a checkout of the review branch, run:

```sh
npm ci
npm run dev
```

Open the local address printed by Astro (normally `http://localhost:4321/`). For the production version, stop the development server and run:

```sh
npm run build
npm test
npm run preview
```

Astro builds the site into `dist/`. GitHub Pages serves the HTML, CSS, images, fonts and JavaScript directly. The theme switch follows the operating system until a visitor makes a choice. The mobile navigation and blog remain accessible without JavaScript.

## Project map

| Location | Purpose |
| --- | --- |
| `src/pages/` | Seven main pages, article routes, error page, sitemap, RSS, and robots rules |
| `src/layouts/Base.astro` | Shared header, navigation, footer, theme controls, social metadata, and JSON-LD |
| `src/components/` | Homepage stethoscope study, timelines, page headings, article cards, and publication records |
| `src/data/profile.ts` | Approved biography, degrees, experience, interests, skills, contact links, CV path, publication and project records |
| `src/content/blog/` | English Markdown articles |
| `src/content.config.ts` and `src/data/categories.ts` | Validated article schema and supported categories |
| `src/lib/articles.ts` | Shared article selection, dates, reading time, and routes |
| `src/lib/stethoscope/` | Procedural instrument geometry, studio lighting, camera motion, and scroll control |
| `src/styles/site.css` | Responsive layout, colour themes, local fonts, reduced motion, and print rules |
| `public/images/` and `public/licenses/` | Public visual assets and third-party notices |
| `templates/article.md` | Draft template kept outside the public collection |
| `scripts/site.test.mjs` | Tests against the actual production output |
| `.github/workflows/pages.yml` | PR build checks and approved-main deployment |
| `astro.config.mjs` | Production origin and root base path |

## Homepage stethoscope study

The opening follows one instrument from its assembled form to the chestpiece, along the tubing and up to the binaural arms. Three.js constructs the parts locally. GSAP ScrollTrigger maps native scroll position to the camera and component poses, so scrolling back retraces the study.

The five chapters are written in HTML in `src/components/StethoscopeSequence.astro`. With JavaScript disabled, reduced motion enabled or WebGL unavailable, readers can follow the text alongside a static rendering of the instrument. The research portfolio and journal follow the study in normal document order.

## Review and publish

1. Review the pull request on GitHub. In **Files changed**, check the biography, licensure disclosure, professional records, and the three opening articles. These articles are original editorial copy for owner review. The research examples in the articles do not describe the owner’s studies or patients.
2. Preview the branch locally with the commands above. To review in a GitHub-connected Codex workspace, select the repository and the PR branch and ask Codex to run the production preview.
3. Before the first approved merge, select **Settings → Pages → Build and deployment → Source → GitHub Actions**. The repository owner controls this setting.
4. Merge the reviewed PR into `main`. The workflow builds and tests again, uploads `dist/`, and deploys with the narrowly scoped `github-pages` environment. Pull requests run the build and tests only.
5. Check the deployment in **Actions → Build and publish portfolio** and open the URL from the **deploy** job.

The Pages URL uses `/` as its base. Keep the source on the review branch until the owner approves publication.

## Add a blog article

Copy `templates/article.md` to `src/content/blog/<descriptive-english-slug>.md`. The filename becomes the public slug. Use the existing articles as examples. Add the title, a unique description, the actual publication date, category, tags, and body. Keep `draft: true` while writing, then set it to `false` in the publication PR. Drafts have no public route and are absent from article lists, RSS, and the sitemap. Keep future articles in draft until their intended release.

Use the category names in `src/data/categories.ts`. Mark one published article `featured: true` for the blog lead. Otherwise the latest published article is featured. Equal-date posts sort by slug. Reading time, related links, date formatting, metadata, social sharing, and table-of-contents links are generated automatically. Three or more second-level headings enable the contents list. Link citations to real sources and clearly distinguish hypothetical examples from findings.

An optional image accepts the following front matter. Supply an owner-approved image and its actual dimensions and alt text.

```yaml
image:
  src: /images/your-article-image.webp
  alt: Describe the actual image in English
  width: 1200
  height: 800
  caption: Optional English caption and credit
```

A future Codex request can say: “Write an English blog article about how to assess a healthcare AI model. Use verified references, follow the existing Markdown template, run the build and tests, and open a PR for review.”

## Update professional records

- Edit `src/data/profile.ts` for personal details, experience, education, skills, research areas, and verified profile URLs. The detailed biography on the About page should agree with these records. Preserve the British Columbia disclosure.
- Add a publication to `publications` only after checking its bibliographic record. Required fields are title, authors, journal, year, and type. Optional fields are DOI (identifier only), abstract or summary, canonical publication URL, and PubMed URL. The research and CV pages share the same component. Keep personal research projects and presentations in their own arrays.
- Put verified public contact links (including ORCID, LinkedIn, Google Scholar, or ResearchGate) in `profiles`. Add a public email only with the owner’s approval. The site does not publish private contact or account details.
- For a CV download, place the approved, accessible PDF under `public/documents/` and set `cvPath` to its root-relative URL. Clear `cvPath` when removing the document. The empty state has no download link.
- To add an authentic portrait, supply `profile.portrait` with `src`, `alt`, `width`, and `height`. It will appear beside the academic background on the homepage.
- Add new top-level public routes to the sitemap’s source list in `src/data/profile.ts` or extend the sitemap generator when a page belongs outside the main navigation.

## Search Console and a future domain

After publication, create a URL-prefix property for `https://iamdrtnt.github.io/` in Google Search Console. Choose HTML-file verification, place the exact Google-provided file in `public/`, and publish it through a reviewed PR. Click **Verify** once the file is publicly accessible. Retain the verification file in future releases.

Submit `sitemap.xml` in **Sitemaps**. Use **URL inspection** on the homepage and important new pages to check the selected canonical and indexing status. Request indexing after substantial additions. Review **Page indexing** for exclusions and **Performance** for impressions, clicks, queries, and trends in searches for the owner’s name. Verification and indexing require the owner’s account and a live site.

When a custom domain is supplied, verify domain ownership in GitHub, follow GitHub Pages’ current DNS instructions, configure the custom domain in repository settings, and update `site` in `astro.config.mjs` in a coordinated release. Keep the root base path. Verify HTTPS, old-address redirects, canonical tags, RSS, sitemap, and social cards on the new domain. Add the new Search Console property and submit its sitemap. [GitHub’s custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

## Verification

Run `npm ci && npm run build && npm test`. The tests inspect every generated HTML document, its internal links and fragments, assets, page titles and descriptions, structured data, language settings, sitemap membership, and feed entries. They also check that the homepage delivers its poster and chapter text in HTML and that the procedural instrument returns to its earlier poses with the same geometry. For visual changes, inspect narrow and wide screens, both themes, keyboard focus, reduced motion, and the mobile menu. Scroll forward and back through the study and follow its links into the portfolio. Check English wording and blog filtering manually as well.

## Visual credits

The procedural stethoscope and its poster are original to this site. The social image uses a rendering of the left cerebral hemisphere from the FreeSurfer fsaverage5 anatomical reference surface distributed by Nilearn. [Source surface](https://github.com/nilearn/nilearn/blob/8a558ba11867c5f1ae91f3abe4ca5a831d419e7e/nilearn/datasets/data/fsaverage5/pial_left.gii.gz) · [Nilearn dataset description](https://nilearn.github.io/stable/modules/generated/nilearn.datasets.fetch_surf_fsaverage.html)

Newsreader and DM Sans are bundled from Fontsource and served locally under their SIL Open Font Licenses. Font, Nilearn, and FreeSurfer notices are in `public/licenses/`.
