import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { load } from "cheerio";
import config from "../astro.config.mjs";
import { createStethoscope } from "../src/lib/stethoscope/model.ts";

const root = path.resolve("dist");
const origin = new URL(config.site).origin;
const visit = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? visit(file) : [file];
  });
const pages = visit(root).filter((file) => file.endsWith(".html"));
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
const titles = new Set(),
  descriptions = new Set();
test("every public document has English metadata, an accessible outline, and valid structured data", () => {
  assert.ok(indexable.length >= 7);
  for (const { $, pathname } of documents) {
    assert.equal($("html").attr("lang"), "en-CA", pathname);
    assert.equal($("main h1").length, 1, pathname);
    assert.equal($("main").length, 1, pathname);
    assert.ok($("title").text().includes("Mohammadreza Norouzi"));
    const description = $('meta[name="description"]').attr("content");
    assert.ok(description?.length > 30);
    assert.ok(!titles.has($("title").text()), pathname);
    assert.ok(!descriptions.has(description), pathname);
    titles.add($("title").text());
    descriptions.add(description);
    assert.equal($('link[rel="canonical"]').length, 1);
    if (pathname !== "/404.html")
      assert.equal($('link[rel="canonical"]').attr("href"), origin + pathname);
    for (const tag of ["og:title", "og:url", "og:description", "og:image"])
      assert.ok($('meta[property="' + tag + '"]').attr("content"));
    assert.ok($('meta[name="twitter:card"]').attr("content"));
    const schema = JSON.parse($('script[type="application/ld+json"]').text());
    assert.equal(schema["@context"], "https://schema.org");
    assert.ok(
      schema["@graph"].some(
        (node) =>
          node["@type"] === "Person" && node.name === "Mohammadreza Norouzi",
      ),
    );
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
    for (const letter of words.match(/\p{L}/gu) || [])
      assert.match(letter, /\p{Script=Latin}/u, pathname);
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
  const rss = load(readFileSync(path.join(root, "rss.xml"), "utf8"), {
    xmlMode: true,
  });
  const posts = indexable.filter(
    (p) => p.pathname.startsWith("/blog/") && p.pathname !== "/blog/",
  );
  assert.deepEqual(
    rss("item > link")
      .map((_, e) => rss(e).text())
      .get()
      .sort(),
    posts.map((p) => origin + p.pathname).sort(),
  );
  posts.forEach(({ $ }) =>
    assert.ok(
      JSON.parse($('script[type="application/ld+json"]').text())["@graph"].some(
        (n) => n["@type"] === "BlogPosting",
      ),
    ),
  );
});

test("Journal covers carry through to the archive and article metadata", () => {
  const archive = documents.find(({ pathname }) => pathname === "/blog/");
  const entries = archive.$(".journal-entry").toArray();
  const posts = indexable.filter(({ pathname }) => pathname.startsWith("/blog/") && pathname !== "/blog/");
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
});
