import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, normalize, relative, resolve } from "node:path";

const siteRoot = resolve(process.argv[2] || "_site");

if (!existsSync(join(siteRoot, "index.html"))) {
  throw new Error(`Pages artifact has no root index.html: ${siteRoot}`);
}

const files = [];
const visit = (directory) => {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) visit(path);
    else files.push(path);
  }
};
visit(siteRoot);

const checkedExtensions = new Set([".html", ".css", ".js"]);
const referencePattern = /(?:href|src)=["']([^"']+)["']|url\(["']?([^)'"\s]+)["']?\)/g;
const failures = [];

const resolveReference = (source, reference) => {
  const clean = reference.split("#", 1)[0].split("?", 1)[0];
  if (!clean || /^(?:[a-z]+:|\/\/|mailto:|tel:|data:)/i.test(clean)) return null;

  const withoutBase = clean.startsWith("/ai-consulting-meta/")
    ? clean.slice("/ai-consulting-meta/".length)
    : clean.startsWith("/")
      ? clean.slice(1)
      : clean;
  const candidate = clean.startsWith("/")
    ? resolve(siteRoot, withoutBase)
    : resolve(source, "..", withoutBase);

  if (existsSync(candidate)) return candidate;
  if (!extname(candidate) && existsSync(`${candidate}.html`)) return `${candidate}.html`;
  if (!extname(candidate) && existsSync(join(candidate, "index.html"))) return join(candidate, "index.html");
  return candidate;
};

for (const file of files.filter((path) => checkedExtensions.has(extname(path)))) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(referencePattern)) {
    const reference = match[1] || match[2];
    const target = resolveReference(file, reference);
    if (target && !existsSync(target)) {
      failures.push(`${relative(siteRoot, file)} -> ${reference} (${normalize(relative(siteRoot, target))})`);
    }
  }
}

const requiredPages = [
  "plans/client-portal/storyboard/client-portal-storyboard.html",
  "plans/client-portal/wireframes/gallery.html",
  "plans/client-portal/feature-roadmap.html",
];

for (const requiredPage of requiredPages) {
  if (!existsSync(join(siteRoot, requiredPage))) failures.push(`missing required page: ${requiredPage}`);
}

if (failures.length) {
  console.error("Pages validation failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Validated ${files.length} generated files with no broken local asset or page links.`);
