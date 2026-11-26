#!/usr/bin/env node
// Usage: npm run new-article "2 ways to show heavy data"
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const POSTS_DIR = path.join(process.cwd(), "public", "blog", "posts");
const TEMPLATE_PATH = path.join(POSTS_DIR, "_template", "index.md");

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
  console.error('Usage: npm run new-article "Your article title"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

if (!slug) {
  console.error(`Could not build a slug from "${title}".`);
  process.exit(1);
}

const postDir = path.join(POSTS_DIR, slug);
if (fs.existsSync(postDir)) {
  console.error(`Post already exists: ${path.relative(process.cwd(), postDir)}`);
  process.exit(1);
}

// Next order = highest existing order + 1 (template excluded).
const maxOrder = fs
  .readdirSync(POSTS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== "_template")
  .map((entry) => path.join(POSTS_DIR, entry.name, "index.md"))
  .filter((file) => fs.existsSync(file))
  .map((file) => fs.readFileSync(file, "utf8").match(/^order:\s*(\d+)/m))
  .filter(Boolean)
  .reduce((max, match) => Math.max(max, Number(match[1])), 0);

const content = fs
  .readFileSync(TEMPLATE_PATH, "utf8")
  .replace(/^title:.*$/m, `title: ${JSON.stringify(title)}`)
  .replace(/^order:\s*\d+/m, `order: ${maxOrder + 1}`)
  .replace(/^date:.*$/m, `date: "${new Date().toISOString().slice(0, 10)}"`)
  .replaceAll("<slug>", slug);

fs.mkdirSync(postDir);
fs.writeFileSync(path.join(postDir, "index.md"), content);

console.log(`Created ${path.relative(process.cwd(), path.join(postDir, "index.md"))}`);

// Social preview diagram (og.txt). Re-run `yarn og <slug>` if the title changes.
const og = spawnSync("python3", ["-I", "scripts/og-diagrams.py", slug], { stdio: "inherit" });
if (og.status !== 0) {
  console.warn(`Could not build og.txt; run \`yarn og ${slug}\` later.`);
}
