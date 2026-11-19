import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { load } from "cheerio";
import config from "../astro.config.mjs";
import { profile } from "../src/data/profile.ts";
import { createStethoscope } from "../src/lib/stethoscope/model.ts";

const root = path.resolve("dist");
const origin = new URL(config.site).origin;
const visit = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? visit(file) : [file];
  });
const verificationFilename = "google418b69e0f9967507.html";
const verificationFile = path.join(root, verificationFilename);
const pages = visit(root).filter(
  (file) => file.endsWith(".html") && file !== verificationFile,
);
test("the Google verification file is copied unchanged to the site root", () => {
  assert.deepEqual(
    readFileSync(verificationFile),
    readFileSync(path.join("public", verificationFilename)),
  );
});
const documents = pages.map((file) => ({
  file,
  $: load(readFileSync(file, "utf8")),
  pathname:
    "/" +
    path
      .relative(root, file)
      .replaceAll(path.sep, "/")
      .replace(/index\.html$/, ""),
}));
const indexable = documents.filter(
  ({ $ }) => !$('meta[name="robots"]').attr("content")?.includes("noindex"),
);
const persian = /\p{Script=Arabic}/u;
const isPersian = (pathname) => pathname.startsWith("/fa/");
const titles = new Set(),
  descriptions = new Set();
test("every public document has localised metadata, an accessible outline, and valid structured data", () => {
  assert.ok(indexable.length >= 7);
  for (const { $, pathname } of documents) {
    const fa = isPersian(pathname);
    const language = fa ? "fa-IR" : "en-CA";
    const name = fa ? "محمدرضا نوروزی" : "Mohammadreza Norouzi";
    assert.equal($("html").attr("lang"), language, pathname);
    assert.equal($("html").attr("dir"), fa ? "rtl" : "ltr", pathname);
    assert.equal($("main h1").length, 1, pathname);
    assert.equal($("main").length, 1, pathname);
    assert.ok($("title").text().includes(name));
    const description = $('meta[name="description"]').attr("content");
    assert.ok(description?.length > 30);
    if (fa) assert.match(description, persian);
    assert.ok(!titles.has($("title").text()), pathname);
    assert.ok(!descriptions.has(description), pathname);
    titles.add($("title").text());
    descriptions.add(description);
    assert.equal($('link[rel="canonical"]').length, 1);
    if (pathname !== "/404.html")
      assert.equal($('link[rel="canonical"]').attr("href"), origin + pathname);
    for (const tag of ["og:title", "og:url", "og:description", "og:image"])
      assert.ok($('meta[property="' + tag + '"]').attr("content"));
    assert.equal($('meta[property="og:locale"]').attr("content"), language.replace("-", "_"));
    assert.equal($('meta[property="og:title"]').attr("content"), $("title").text());
    assert.equal($('meta[property="og:description"]').attr("content"), description);
    assert.equal($('meta[property="og:url"]').attr("content"), $('link[rel="canonical"]').attr("href"));
    assert.ok($('meta[name="twitter:card"]').attr("content"));
    const schema = JSON.parse($('script[type="application/ld+json"]').text());
    assert.equal(schema["@context"], "https://schema.org");
    assert.ok(
      schema["@graph"].some(
        (node) =>
          node["@type"] === "Person" && node.name === name && node["@id"] === origin + "/#person",
      ),
    );
    const webpage = schema["@graph"].find((node) => node["@id"]?.endsWith("#page"));
    assert.equal(webpage?.inLanguage, language);
    assert.equal(webpage?.url, $('link[rel="canonical"]').attr("href"));
    assert.equal(webpage?.description, description);
    $("img").each((_, image) => {
      assert.ok($(image).attr("alt")?.trim(), pathname);
      assert.ok(
        Number($(image).attr("width")) && Number($(image).attr("height")),
        pathname,
      );
    });
    const visible = $("body").clone();
    visible.find("script,style").remove();
    const words = visible.text() + description + JSON.stringify(schema);
    if (fa) {
      assert.match($("main h1").text(), persian, pathname);
      assert.ok(visible.find("main").text().match(/\p{Script=Arabic}/gu)?.length > (pathname === "/fa/404/" ? 40 : 70), pathname);
      assert.ok($('link[as="font"][href="/fonts/vazirmatn-arabic.woff2"]').length);
    } else {
      for (const letter of words.match(/\p{L}/gu) || [])
        assert.match(letter, /\p{Script=Latin}/u, pathname);
    }
  }
});
test("local links, fragments, scripts, styles, images and share cards resolve", () => {
  for (const { $, pathname } of documents) {
    const assets = $("[href],[src]")
      .map((_, el) => $(el).attr("href") ?? $(el).attr("src"))
      .get();
    assets.push($('meta[property="og:image"]').attr("content"));
    for (const value of assets) {
      assert.ok(value && value !== "#", pathname + " has an empty destination");
      const url = new URL(value, origin + pathname);
      if (url.protocol === "mailto:" || url.origin !== origin) continue;
      let file = path.join(root, decodeURIComponent(url.pathname));
      if (existsSync(file) && statSync(file).isDirectory())
        file = path.join(file, "index.html");
      // Astro generates the GitHub Pages error document as 404.html.
      if (url.pathname === "/404/") file = path.join(root, "404.html");
      assert.ok(existsSync(file), pathname + " → " + url.pathname);
      if (url.hash && file.endsWith(".html")) {
        const ids =
          documents
            .find((d) => d.file === file)
            ?.$("[id]")
            .map((_, el) => el.attribs.id)
            .get() || [];
        assert.ok(
          ids.includes(decodeURIComponent(url.hash.slice(1))),
          pathname + " → " + value,
        );
      }
    }
  }
});
test("the homepage delivers the study chapters and instrument poster in static HTML", () => {
  const { $ } = documents.find(({ pathname }) => pathname === "/");
  const study = $("main [data-study]");
  const chapters = study.find("[data-chapter]");
  const text = (element) => $(element).text().replace(/\s+/g, " ").trim();

  assert.equal(study.length, 1);
  assert.equal(study.find("canvas").length, 1);
  const poster = study.find("img.study-poster");
  assert.equal(poster.length, 1);
  assert.ok(poster.attr("src")?.startsWith("/images/"));
  assert.match(poster.attr("alt"), /stethoscope/i);
  assert.equal(chapters.length, 5);

  assert.match(text(chapters.eq(0).find("h1")), /Mohammadreza\s+Norouzi/);
  for (const [i, [pillar, subtitle]] of [
    ["Medicine", "Where Knowledge Meets Responsibility."],
    ["Research", "Driven by Curiosity. Guided by Evidence."],
    ["Innovation", "Rethinking Healthcare. Expanding Access."],
  ].entries()) {
    const copy = text(chapters.eq(i + 1)).toLowerCase();
    assert.ok(copy.includes(pillar.toLowerCase()), pillar);
    assert.ok(copy.includes(subtitle.toLowerCase()), subtitle);
  }

  chapters.each((_, chapter) => {
    const heading = $(chapter).find("h1,h2").first();
    assert.ok(text(heading));
    assert.equal(
      heading.closest('[hidden],[inert],[aria-hidden="true"]').length,
      0,
    );
  });
  const chapterLinks = study.find('nav[aria-label="Study chapters"] a');
  assert.deepEqual(
    chapterLinks.map((_, link) => $(link).attr("href")).get(),
    chapters.map((_, chapter) => "#" + $(chapter).attr("id")).get(),
  );
  const portfolio = $("#portfolio");
  assert.equal(portfolio.length, 1);
  assert.equal(portfolio.closest("[data-study]").length, 0);
  assert.ok(study.find('a[href="#portfolio"]').length, "Native link past the study");
  for (const href of ["/research/#publications", "/blog/"]) {
    assert.ok($(`main a[href="${href}"]`).length, href);
  }
});
test("the instrument retraces its component poses using the same meshes and geometry", (t) => {
  const instrument = createStethoscope();
  t.after(() => instrument.dispose());

  function pose(medicine, research, innovation) {
    instrument.update(medicine, research, innovation);
    instrument.root.updateMatrixWorld(true);
    return [instrument.chest, ...instrument.earTips].map((part) =>
      part.matrixWorld.toArray(),
    );
  }

  function meshIdentities() {
    const meshes = [];
    instrument.root.traverse((part) => {
      if (part.isMesh) meshes.push([part.uuid, part.geometry.uuid]);
    });
    return meshes;
  }

  const assembled = pose(0, 0, 0);
  const identities = meshIdentities();
  assert.ok(identities.length > 0);
  const intermediate = pose(0.37, 0.56, 0.22);
  const [chest, leftEar, rightEar] = pose(1, 1, 1);
  assert.notDeepEqual(chest, assembled[0], "Chestpiece separates");
  assert.notDeepEqual(leftEar, assembled[1], "Left earpiece moves");
  assert.notDeepEqual(rightEar, assembled[2], "Right earpiece moves");
  assert.deepEqual(meshIdentities(), identities);

  assert.deepEqual(pose(0.37, 0.56, 0.22), intermediate);
  assert.deepEqual(pose(0, 0, 0), assembled);
  assert.deepEqual(meshIdentities(), identities);
});
test("the sitemap, robots, and RSS match the indexable pages and published articles", () => {
  const sitemap = load(readFileSync(path.join(root, "sitemap.xml"), "utf8"), {
    xmlMode: true,
  });
  assert.deepEqual(
    sitemap("loc")
      .map((_, e) => sitemap(e).text())
      .get()
      .sort(),
    indexable.map((p) => origin + p.pathname).sort(),
  );
  assert.ok(
    readFileSync(path.join(root, "robots.txt"), "utf8").includes(
      "Sitemap: " + origin + "/sitemap.xml",
    ),
  );
  for (const prefix of ["", "/fa"]) {
    const rss = load(readFileSync(path.join(root, prefix, "rss.xml"), "utf8"), {
      xmlMode: true,
    });
    const posts = indexable.filter(
      (p) => p.pathname.startsWith(prefix + "/blog/") && p.pathname !== prefix + "/blog/",
    );
    assert.deepEqual(
      rss("item > link")
        .map((_, e) => rss(e).text())
        .get()
        .sort(),
      posts.map((p) => origin + p.pathname).sort(),
    );
    assert.equal(rss("channel > language").text(), prefix ? "fa-ir" : "en-ca");
    for (const entry of rss("item").toArray()) {
      assert.equal(persian.test(rss(entry).find("title").text()), Boolean(prefix));
      assert.equal(persian.test(rss(entry).find("description").text()), Boolean(prefix));
    }
    posts.forEach(({ $ }) =>
      assert.ok(
        JSON.parse($('script[type="application/ld+json"]').text())["@graph"].some(
          (n) => n["@type"] === "BlogPosting",
        ),
      ),
    );
  }
});

test("Journal covers carry through to the archive and article metadata", () => {
  for (const prefix of ["", "/fa"]) {
    const archive = documents.find(({ pathname }) => pathname === prefix + "/blog/");
    const entries = archive.$(".journal-entry").toArray();
    const posts = indexable.filter(({ pathname }) => pathname.startsWith(prefix + "/blog/") && pathname !== prefix + "/blog/");
    assert.deepEqual(
      entries.map((entry) => archive.$(entry).find("h3 a").attr("href")).sort(),
      posts.map(({ pathname }) => pathname).sort(),
    );
    for (const { $, pathname } of posts) {
      const image = $(".journal-article-figure img");
      if (!image.length) continue;

      const src = image.attr("src");
      const alt = image.attr("alt");
      const entry = entries.find((item) => archive.$(item).find("h3 a").attr("href") === pathname);
      const shareImage = new URL(src, origin).href;
      const schema = JSON.parse($('script[type="application/ld+json"]').text());
      const article = schema["@graph"].find((node) => node["@type"] === "BlogPosting");

      assert.equal(archive.$(entry).find("img").attr("src"), src, pathname);
      assert.equal(archive.$(entry).find("img").attr("alt"), alt, pathname);
      assert.equal($('meta[property="og:image"]').attr("content"), shareImage, pathname);
      assert.equal($('meta[property="og:image:alt"]').attr("content"), alt, pathname);
      assert.equal($('meta[name="twitter:image"]').attr("content"), shareImage, pathname);
      assert.equal($('meta[name="twitter:image:alt"]').attr("content"), alt, pathname);
      assert.equal(article.image, shareImage, pathname);
    }
  }
});

const originalRoutes = [
  "/", "/about/", "/experience/", "/research/", "/blog/", "/cv/", "/contact/",
  "/blog/ai-in-primary-care-patient-safety/",
  "/blog/reading-a-clinical-trial/",
  "/blog/turning-a-clinical-observation-into-a-question/",
  "/blog/where-a-medical-ai-model-is-tested/",
];
const byPath = new Map(documents.map((page) => [page.pathname, page]));

test("original routes and their Persian counterparts have reciprocal alternates and real switch links", () => {
  for (const path of originalRoutes) assert.ok(byPath.has(path), path);
  assert.ok(byPath.has("/404.html"));
  assert.ok(byPath.has("/fa/404/"));
  assert.equal(byPath.get("/404.html").$('.locale-switch [hreflang="fa-IR"]').attr("href"), "/fa/404/");
  assert.equal(byPath.get("/fa/404/").$('.locale-switch [hreflang="en-CA"]').attr("href"), "/404.html");

  for (const { $, pathname } of indexable) {
    const fa = isPersian(pathname);
    const english = fa ? pathname.slice(3) : pathname;
    const farsi = "/fa" + english;
    assert.ok(byPath.has(english) && byPath.has(farsi), pathname);
    assert.equal($('link[hreflang="en-CA"]').attr("href"), origin + english);
    assert.equal($('link[hreflang="fa-IR"]').attr("href"), origin + farsi);
    assert.equal($('link[hreflang="x-default"]').attr("href"), origin + english);
    assert.equal($('.locale-switch a[hreflang="en-CA"]').attr("href"), english);
    assert.equal($('.locale-switch a[hreflang="fa-IR"]').attr("href"), farsi);
    assert.equal($(".locale-switch a[aria-current]").attr("hreflang"), fa ? "fa-IR" : "en-CA");
    assert.equal($('meta[property="og:locale:alternate"]').attr("content"), fa ? "en_CA" : "fa_IR");

    $("main a, #navigation a, footer a").each((_, el) => {
      const href = $(el).attr("href");
      if (href?.startsWith("/") && !href.startsWith("//") && !$(el).attr("download")) {
        assert.equal(isPersian(href), fa, pathname + " → " + href);
      }
    });
  }
});

test("published Persian articles carry complete bodies, equivalent sections, and the original references", () => {
  const externalLinks = ($) => $(".journal-body a").map((_, el) =>
    $(el).attr("href")?.startsWith("https://") ? $(el).attr("href") : null,
  ).get();
  for (const { $, pathname } of indexable.filter(({ pathname }) => pathname.startsWith("/fa/blog/") && pathname !== "/fa/blog/")) {
    const en = byPath.get(pathname.slice(3)).$;
    assert.equal($(".journal-byline time").attr("datetime"), en(".journal-byline time").attr("datetime"));
    assert.match($(".journal-byline time").text(), persian);
    assert.match($(".journal-byline").text(), /[۰-۹]+ دقیقه مطالعه/u);
    assert.ok($(".journal-takeaways li").length >= 2);
    assert.match($(".journal-tags").text(), persian);
    assert.match($(".journal-article-figure img").attr("alt"), persian);
    assert.equal($(".journal-article-figure img").attr("src"), en(".journal-article-figure img").attr("src"));
    assert.deepEqual(externalLinks($), externalLinks(en));
    assert.equal($(".journal-body p").length, en(".journal-body p").length);
    for (const paragraph of $(".journal-body p").toArray()) {
      const text = $(paragraph).text().replace(/[^\p{L}]/gu, "");
      assert.ok((text.match(/\p{Script=Arabic}/gu)?.length || 0) / text.length > 0.7, pathname);
    }
    const headings = ($) => $(".journal-body :is(h2,h3,h4,h5,h6)").toArray();
    assert.deepEqual(headings($).map((el) => el.name), headings(en).map((el) => el.name));
    const fragments = JSON.parse($('.locale-switch a[hreflang="en-CA"]').attr("data-fragments"));
    const reverse = JSON.parse(en('.locale-switch a[hreflang="fa-IR"]').attr("data-fragments"));
    for (const el of headings($)) {
      const id = $(el).attr("id");
      assert.match($(el).text(), persian);
      assert.equal(reverse[fragments[id]], id);
      assert.ok(en("[id]").toArray().some((target) => target.attribs.id === fragments[id]));
    }
  }
});

test("draft manuscripts stay out of both route trees, feeds and the sitemap", () => {
  for (const [collection, prefix] of [["blog", ""], ["blog-fa", "/fa"]]) {
    const feed = readFileSync(path.join(root, prefix, "rss.xml"), "utf8");
    const sitemap = readFileSync(path.join(root, "sitemap.xml"), "utf8");
    for (const file of visit(path.resolve("src/content", collection)).filter((v) => v.endsWith(".md"))) {
      const frontmatter = readFileSync(file, "utf8").split(/^---\s*$/m)[1] ?? "";
      if (!/^draft:\s*true\b/m.test(frontmatter)) continue;
      const slug = frontmatter.match(/^slug:\s*["']?([\w-]+)["']?/m)?.[1] ?? path.basename(file, ".md");
      const route = prefix + "/blog/" + slug + "/";
      assert.ok(!byPath.has(route), route);
      assert.ok(!feed.includes(origin + route), route);
      assert.ok(!sitemap.includes(origin + route), route);
    }
  }
});

test("Persian chapters preserve the instrument and the professional timeline preserves its two stages", () => {
  const en = byPath.get("/").$;
  const fa = byPath.get("/fa/").$;
  const chapters = ($) => $("[data-chapter]").toArray();
  assert.deepEqual(chapters(fa).map((el) => el.attribs.id), chapters(en).map((el) => el.attribs.id));
  assert.equal(fa("[data-instrument]").length, 1);
  assert.equal(fa(".study-poster").attr("src"), en(".study-poster").attr("src"));
  assert.match(fa(".study-poster").attr("alt"), persian);
  assert.match(fa("[data-study]").attr("data-scroll-label"), persian);
  for (const chapter of chapters(fa)) {
    assert.match(fa(chapter).find("h1,h2").text(), persian);
    assert.match(fa(chapter).find(".study-identity,.study-description").text(), persian);
    assert.match(chapter.attribs["data-figure"], persian);
  }

  for (const prefix of ["", "/fa"]) {
    const exp = byPath.get(prefix + "/experience/").$;
    assert.equal(exp(".professional-timeline .completed").length, 2);
    assert.equal(exp(".professional-timeline .future .continuation").length, 1);
    assert.deepEqual(exp(".professional-timeline h3").map((_, el) => exp(el).text()).get(),
      prefix
        ? ["کارورزی بالینی", "پزشک مسئول اصلی", "در مسیر دریافت پروانهٔ پزشکی در کانادا"]
        : ["Clinical Internship", "Most Responsible Physician", "Working Toward Medical Licensure"],
    );
    assert.match(exp(".professional-timeline .future .detail").text(),
      prefix ? /در حال طی کردن مراحل/u : /toward becoming/u);
    const cv = byPath.get(prefix + "/cv/").$;
    const download = cv(".cv-download a[download]");
    assert.equal(download.length, Number(Boolean(profile.cvPath)));
    if (profile.cvPath) {
      assert.equal(download.attr("href"), profile.cvPath);
      if (prefix) assert.match(download.text(), /به زبان انگلیسی/u);
    }
    assert.equal(cv("main").text().match(prefix ? /۲۰۲۴–۲۰۲۶/g : /2024–2026/g)?.length, 1);
  }
});
