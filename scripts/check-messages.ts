/**
 * Fails when a locale's message files drift from English, the source of the key types: a missing or extra namespace
 * file, a missing or extra key, an empty string, or a word the Arabic copy avoids. Run with `bun run check:messages`.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MESSAGES_DIR = join(import.meta.dirname, "../src/messages");
const SOURCE = "en";
// جير reads as something else in Arabic, and الرف doesn't land as "the shelf" the way it does in English.
const AVOIDED_WORDS: [RegExp, string][] = [
  [/(?<!\p{L})(?:ال|بال|لل)?جير(?!\p{L})/u, "منتجات"],
  [/(?<!\p{L})(?:ال|بال|لل|عال)?رف(?!\p{L})/u, "التشكيلة"],
];

type Tree = { [key: string]: string | Tree };

function leaves(tree: Tree, prefix = ""): Map<string, string> {
  const result = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") result.set(path, value);
    else for (const [p, v] of leaves(value, path)) result.set(p, v);
  }
  return result;
}

const read = (locale: string, file: string) =>
  leaves(
    JSON.parse(readFileSync(join(MESSAGES_DIR, locale, file), "utf8")) as Tree,
  );

const jsonFiles = (locale: string) =>
  readdirSync(join(MESSAGES_DIR, locale))
    .filter((file) => file.endsWith(".json"))
    .sort();

const problems: string[] = [];
const sourceFiles = jsonFiles(SOURCE);
const locales = readdirSync(MESSAGES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== SOURCE)
  .map((entry) => entry.name);

for (const locale of locales) {
  const files = jsonFiles(locale);
  for (const file of files) {
    if (!sourceFiles.includes(file))
      problems.push(`${locale}/${file}: no ${SOURCE}/${file} to match`);
  }

  for (const file of sourceFiles) {
    if (!files.includes(file)) {
      problems.push(`${locale}/${file}: missing`);
      continue;
    }
    const source = read(SOURCE, file);
    const target = read(locale, file);
    for (const key of source.keys()) {
      if (!target.has(key))
        problems.push(`${locale}/${file}: missing "${key}"`);
    }
    for (const [key, value] of target) {
      if (!source.has(key)) problems.push(`${locale}/${file}: extra "${key}"`);
      else if (!value.trim())
        problems.push(`${locale}/${file}: empty "${key}"`);
      for (const [word, instead] of AVOIDED_WORDS) {
        const found = word.exec(value)?.[0];
        if (found)
          problems.push(
            `${locale}/${file}: "${key}" says ${found}, write ${instead}`,
          );
      }
    }
  }
}

if (problems.length > 0) {
  console.error(
    `Message files need fixing:\n${problems.map((p) => `  ${p}`).join("\n")}`,
  );
  process.exit(1);
}
console.log(
  `Messages in sync: ${locales.join(", ")} match ${SOURCE} across ${sourceFiles.length} namespaces.`,
);
