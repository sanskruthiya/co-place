import { copyFile, mkdir, readFile, readdir, realpath, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import MarkdownIt from "markdown-it";
import { parse } from "yaml";

const markdown = new MarkdownIt({ html: false });
const escape = (value) => markdown.utils.escapeHtml(String(value));
const intro = "地図や地域の暮らしについて、調べたこと・聞いたことをまとめています。";

export function parseArticle(source, filename) {
  const match = source.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: YAML front matter is required`);
  const data = parse(match[1]);
  const slug = filename.replace(/(?:\.draft)?\.md$/, "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${filename}: invalid article slug`);
  for (const field of ["title", "description"]) {
    if (typeof data?.[field] !== "string" || !data[field].trim()) throw new Error(`${filename}: ${field} is required`);
  }
  if (data.draft !== undefined && typeof data.draft !== "boolean") throw new Error(`${filename}: draft must be boolean`);
  if (data.date !== undefined || !data.draft) {
    if (typeof data.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)
      || !Number.isFinite(Date.parse(data.date)) || new Date(data.date).toISOString().slice(0, 10) !== data.date) {
      throw new Error(`${filename}: date must be a valid YYYY-MM-DD (required for publication)`);
    }
  }
  return { slug, title: data.title, description: data.description, date: data.date, draft: data.draft === true, body: match[2] };
}

function dateLabel(article) {
  return article.date ? `<time datetime="${escape(article.date)}">${escape(article.date.replaceAll("-", "."))}</time>` : "";
}

function entries(articles) {
  return `<ul class="article-list">${articles.map((article) => `<li>${dateLabel(article)}${article.draft ? '<span class="draft-label">下書き</span>' : ""}<h3><a href="/articles/${article.slug}/">${escape(article.title)}</a></h3><p>${escape(article.description)}</p></li>`).join("")}</ul>`;
}

function page(title, description, body, preview) {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} | 柏たなかマップログ</title>
<meta name="description" content="${escape(description)}">
${preview ? '<meta name="robots" content="noindex, nofollow">' : ""}
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:type" content="article">
<link rel="icon" href="/favicon-32x32.png">
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="/articles/articles.css">
</head>
<body>
<a class="skip-link" href="#main">本文へ移動</a>
<header class="site-header"><a class="brand" href="/"><img src="/header-icon.png" width="43" height="43" alt=""><span>柏たなかマップログ</span></a><nav aria-label="メインナビゲーション"><a href="/#maps">地図一覧</a><a href="/articles/">地域のメモ</a></nav></header>
<main id="main" class="article-main">${preview ? '<p class="draft-notice">開発プレビュー：下書きを含む表示です。本番には公開されません。</p>' : ""}${body}</main>
<footer><p>柏たなかマップログ</p><a href="/">トップへ戻る</a></footer>
</body>
</html>`;
}

export async function buildArticles({ root, outputRoot, preview, reserve }) {
  const sourceRoot = path.join(root, "article-materials");
  const files = (await readdir(sourceRoot)).filter((name) => name.endsWith(".md")).sort();
  const all = await Promise.all(files.map(async (file) => parseArticle(await readFile(path.join(sourceRoot, file), "utf8"), file)));
  const slugs = new Set();
  for (const article of all) {
    if (slugs.has(article.slug)) throw new Error(`Duplicate article slug: ${article.slug}`);
    slugs.add(article.slug);
  }
  const articles = all.filter((article) => preview || !article.draft)
    .sort((a, b) => (b.date ?? "9999").localeCompare(a.date ?? "9999") || a.slug.localeCompare(b.slug));
  async function emit(relative, contents) {
    reserve(relative);
    const destination = path.join(outputRoot, relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, contents);
  }
  const resolvedSource = await realpath(sourceRoot);
  for (const article of articles) {
    const tokens = markdown.parse(article.body, {});
    const assets = new Map();
    async function visit(nodes) {
      for (const token of nodes) {
        if (token.type === "heading_open" && token.tag === "h1") throw new Error(`${article.slug}: use ## or deeper headings in the body`);
        if (token.type === "image") {
          const src = token.attrGet("src");
          if (/^(?:https?:\/\/|\/)/i.test(src)) {
            if (src.startsWith("//")) throw new Error(`${article.slug}: protocol-relative images are not supported`);
          } else {
            const decoded = decodeURIComponent(src);
            if (!/^\.\/[a-zA-Z0-9_\-\u0080-\uFFFF.]+\.(?:webp|png|jpe?g|gif)$/i.test(decoded)) throw new Error(`${article.slug}: local images must be ./filename.webp (or png/jpg/gif)`);
            const name = decoded.slice(2);
            const source = await realpath(path.join(sourceRoot, name));
            if (path.dirname(source) !== resolvedSource) throw new Error(`${article.slug}: image is outside article-materials`);
            if ((await stat(source)).size > 25 * 1024 * 1024) throw new Error(`${name}: image exceeds 25 MiB`);
            assets.set(name, source);
            token.attrSet("src", `./${encodeURIComponent(name)}`);
          }
          token.attrSet("loading", "lazy");
        }
        if (token.children) await visit(token.children);
      }
    }
    await visit(tokens);
    const html = markdown.renderer.render(tokens, markdown.options, {});
    await emit(`articles/${article.slug}/index.html`, page(article.title, article.description,
      `<p class="article-breadcrumb"><a href="/">トップ</a> / <a href="/articles/">地域のメモ</a></p><article><header class="article-heading"><p class="eyebrow">地域のメモ</p><h1>${escape(article.title)}</h1>${dateLabel(article)}<p>${escape(article.description)}</p></header><div class="article-body">${html}</div></article><p class="article-back"><a href="/articles/">地域のメモ一覧へ戻る</a></p>`, preview));
    for (const [name, source] of assets) {
      const relative = `articles/${article.slug}/${name}`;
      reserve(relative);
      await copyFile(source, path.join(outputRoot, relative));
    }
  }
  await emit("articles/index.html", page("地域のメモ", intro,
    `<p class="article-breadcrumb"><a href="/">トップ</a> / 地域のメモ</p><h1>地域のメモ</h1><p>${intro}</p>${articles.length ? entries(articles) : "<p>公開記事はまだありません。</p>"}`, preview));
  await emit("articles/articles.css", await readFile(path.join(root, "sites/kashiwa/articles/styles.css"), "utf8"));
  const homepagePath = path.join(outputRoot, "index.html");
  const homepage = await readFile(homepagePath, "utf8");
  const marker = '<div data-article-notes></div>';
  if (!homepage.includes(marker)) throw new Error("Homepage article insertion point is missing");
  const section = articles.length ? `<section class="section notes-section" id="notes" aria-labelledby="notes-title"><p class="eyebrow">LOCAL NOTES</p><h2 id="notes-title">地域のメモ</h2><p>${intro}</p>${preview ? '<p class="draft-label">開発プレビュー：下書きを含みます</p>' : ""}${entries(articles.slice(0, 3))}${articles.length > 3 ? '<p><a href="/articles/">地域のメモをすべて見る</a></p>' : ""}</section>` : "";
  await writeFile(homepagePath, homepage.replace(marker, section));
  console.log(`Built ${articles.length} articles${preview ? " (including drafts)" : " (published only)"}`);
}
