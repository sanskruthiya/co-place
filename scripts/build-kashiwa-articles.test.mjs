import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildArticles, parseArticle } from "./build-kashiwa-articles.mjs";

const source = (fields = "draft: true", body = "## 本文\n\nテスト") => `---\ntitle: "記事タイトル"\ndescription: "記事の説明"\n${fields}\n---\n${body}`;

test("validates metadata, dates and slugs", () => {
  assert.equal(parseArticle(source(), "sample.draft.md").slug, "sample");
  assert.equal(parseArticle(source("date: '2026-10-29'"), "sample.md").date, "2026-10-29");
  for (const fields of ["draft: false", "draft: 'true'", "date: '2026-02-30'", "date: 'invalid'", "title: null"]) {
    assert.throws(() => parseArticle(source(fields), "sample.md"));
  }
  assert.throws(() => parseArticle(source(), "../sample.md"));
  assert.throws(() => parseArticle("本文のみ", "sample.md"));
});

async function fixture(t, files, preview) {
  const root = await mkdtemp(path.join(os.tmpdir(), "kashiwa-articles-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const outputRoot = path.join(root, "output");
  await mkdir(path.join(root, "article-materials"));
  await mkdir(path.join(root, "sites/kashiwa/articles"), { recursive: true });
  await mkdir(outputRoot);
  await writeFile(path.join(root, "sites/kashiwa/articles/styles.css"), "body {}");
  await writeFile(path.join(outputRoot, "index.html"), '<div data-article-notes></div>');
  for (const [file, text] of Object.entries(files)) await writeFile(path.join(root, "article-materials", file), text);
  const outputs = new Set();
  return { outputRoot, build: () => buildArticles({ root, outputRoot, preview, reserve(relative) {
    assert.ok(!outputs.has(relative));
    outputs.add(relative);
  } }) };
}

test("production excludes draft pages, assets and homepage links, including raw interview notes", async (t) => {
  const { outputRoot, build } = await fixture(t, {
    "draft.md": source("draft: true", "![画像](./photo.webp)"),
    "photo.webp": "image",
    "interview.txt": "PRIVATE INTERVIEW",
  }, false);
  await build();
  assert.deepEqual((await readdir(path.join(outputRoot, "articles"))).sort(), ["articles.css", "index.html"]);
  assert.equal(await readFile(path.join(outputRoot, "index.html"), "utf8"), "");
});

test("preview renders draft, escapes HTML and copies only referenced images", async (t) => {
  const { outputRoot, build } = await fixture(t, {
    "draft.md": source("draft: true", '## 見出し\n\n<script>alert(1)</script>\n\n[危険](javascript:alert(1))\n\n![画像](./photo.webp)'),
    "photo.webp": "image",
    "unused.webp": "unused",
    "interview.txt": "PRIVATE INTERVIEW",
  }, true);
  await build();
  const html = await readFile(path.join(outputRoot, "articles/draft/index.html"), "utf8");
  assert.match(html, /noindex, nofollow/);
  assert.match(html, /開発プレビュー/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>|href="javascript:/);
  assert.match(html, /<h2>見出し<\/h2>/);
  assert.deepEqual((await readdir(path.join(outputRoot, "articles/draft"))).sort(), ["index.html", "photo.webp"]);
  assert.match(await readFile(path.join(outputRoot, "index.html"), "utf8"), /href="\/articles\/draft\/"/);
});

test("published articles sort newest first and homepage shows at most three", async (t) => {
  const files = Object.fromEntries([1, 2, 3, 4].map((n) => [`article-${n}.md`, source(`date: '2026-10-0${n}'`)]));
  const { outputRoot, build } = await fixture(t, files, false);
  await build();
  const home = await readFile(path.join(outputRoot, "index.html"), "utf8");
  assert.ok(home.indexOf("/article-4/") < home.indexOf("/article-3/"));
  assert.doesNotMatch(home, /\/article-1\//);
  assert.match(home, /地域のメモをすべて見る/);
  assert.match(await readFile(path.join(outputRoot, "articles/index.html"), "utf8"), /\/article-1\//);
});

test("duplicate slugs fail", async (t) => {
  const { build } = await fixture(t, { "same.md": source(), "same.draft.md": source() }, true);
  await assert.rejects(build, /Duplicate article slug/);
});

test("missing images, traversal and body h1 fail", async (t) => {
  for (const body of ["![画像](./missing.webp)", "![画像](../secret.webp)", "# 重複タイトル"]) {
    const { build } = await fixture(t, { "sample.md": source("draft: true", body) }, true);
    await assert.rejects(build);
  }
});
