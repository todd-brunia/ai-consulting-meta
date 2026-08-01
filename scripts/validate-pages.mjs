import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, normalize, relative, resolve } from "node:path";

const siteRoot = resolve(process.argv[2] || "_site");
const sourceRoot = resolve(process.argv[3] || "_pages-source");

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

const plansRoot = join(sourceRoot, "plans");
const landingPage = readFileSync(join(siteRoot, "index.html"), "utf8");
const initiativeOrders = new Map();
let initiativeCount = 0;

const frontMatterValue = (frontMatter, key) => {
  const match = frontMatter.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m"));
  return match?.[1]?.replace(/^['"]|['"]$/g, "");
};

for (const entry of readdirSync(plansRoot, { withFileTypes: true }).filter((item) => item.isDirectory())) {
  const initiativeIndex = join(plansRoot, entry.name, "index.md");
  if (!existsSync(initiativeIndex)) {
    failures.push(`missing initiative index: plans/${entry.name}/index.md`);
    continue;
  }

  const content = readFileSync(initiativeIndex, "utf8");
  const frontMatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
  if (!frontMatter || frontMatterValue(frontMatter, "initiative") !== "true") {
    failures.push(`missing Pages initiative front matter: plans/${entry.name}/index.md`);
    continue;
  }

  initiativeCount += 1;
  const requiredMetadata = ["title", "description", "initiative_order", "initiative_status"];
  for (const key of requiredMetadata) {
    if (!frontMatterValue(frontMatter, key)) failures.push(`missing ${key}: plans/${entry.name}/index.md`);
  }

  const order = frontMatterValue(frontMatter, "initiative_order");
  if (order && initiativeOrders.has(order)) {
    failures.push(`duplicate initiative_order ${order}: plans/${initiativeOrders.get(order)}/ and plans/${entry.name}/`);
  } else if (order) {
    initiativeOrders.set(order, entry.name);
  }

  const generatedIndex = join(siteRoot, "plans", entry.name, "index.html");
  if (!existsSync(generatedIndex)) failures.push(`missing rendered initiative index: plans/${entry.name}/index.html`);
  if (!landingPage.includes(`/plans/${entry.name}/`)) failures.push(`initiative absent from landing page: ${entry.name}`);
}

if (failures.length) {
  console.error("Pages validation failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Validated ${initiativeCount} initiatives and ${files.length} generated files with no broken local links.`);
