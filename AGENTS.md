# Kashiwa site workflow

- `npm run test:articles` runs article generator tests using Node's built-in test runner.
- `npm run check:kashiwa` builds published content and runs a Wrangler deployment dry run; it does not deploy.
- `npm run dev:kashiwa` builds drafts into `sites/kashiwa/.preview-dist` and starts local Wrangler. Restart after editing Markdown or templates; Markdown is not watched automatically.
- `npm run build:kashiwa` and `npm run deploy:kashiwa` use `sites/kashiwa/dist`, excluding draft articles and their images. Keep preview and production output separate.
- Article sources are the top-level Markdown files in `article-materials/`. Required front matter: `title`, `description`; `date` is required for published articles and uses a quoted `YYYY-MM-DD` string. `draft: true` prevents publication.
- Article filenames use lowercase ASCII letters, digits and hyphens. An optional `.draft` suffix is stripped when generating `/articles/<slug>/`; front matter, not the filename, determines publication status.
- Local article images use `./filename.webp` (also PNG, JPEG or GIF) and live beside the Markdown. Only referenced local images of included articles are copied. Interview text files and unused images are not published. Do not commit private interview notes inadvertently.
- The homepage's `data-article-notes` placeholder is replaced at build time with up to three articles. With no published articles the section is hidden. More than three articles adds an archive link.
- Article templates and validation are in `scripts/build-kashiwa-articles.mjs`; article styles are in `sites/kashiwa/articles/styles.css`. Raw HTML in Markdown is disabled.
