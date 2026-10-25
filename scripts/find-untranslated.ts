/**
 * Lists hardcoded English a customer can see: JSX text, user-visible string props (aria-label, title, placeholder,
 * alt, label) and, in src/lib, string literals that read like a sentence. Prints file:line and the text. Run with
 * `bun run i18n:scan`; it exits 1 when it finds anything, so it can gate later once the allowlist settles.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";

const ROOT = join(import.meta.dirname, "..");

const SCAN = ["src/app/[locale]", "src/components", "src/lib"];
const SKIP = [
  // shadcn and Base UI primitives; their strings are screen-reader defaults that callers override
  "src/components/ui/",
  // the data grid, filters and cascader only render in the admin
  "src/components/reui/",
  // the rich-text editor's extensions, admin only
  "src/lib/editor/",
  // only the admin renders these, so their English is right
  "src/components/payment-method.tsx",
  "src/app/[locale]/(public)/(protected)/_components/payment-method.tsx",
  "src/components/combobox.tsx",
  // zod messages: server contracts the customer never reads, and the address and phone ones the address form maps
  // to checkout.addressForm.errors
  "src/lib/schemas/",
  // schema.org values for search engines, never rendered
  "src/lib/seo/structured-data.ts",
];

const VISIBLE_PROPS = new Set([
  "aria-label",
  "title",
  "placeholder",
  "alt",
  "label",
]);

/** Names that stay Latin on the Arabic pages too. */
const ALLOWED = new Set([
  "Gear Verse",
  "InstaPay",
  "Vodafone",
  "Orange",
  "Vodafone Cash",
  "Orange Cash",
  "e&",
  "e& cash",
  "Razer",
  "AKKO",
  "SIMGOT",
  "EGP",
  // the brand monogram on the mock chat avatar
  "GV",
  // keyboard keys, printed on the keycaps in Latin on Arabic keyboards too
  "Esc",
  "Ctrl K",
]);

const isScanned = (path: string) =>
  /\.(tsx?|jsx?)$/.test(path) &&
  !path.endsWith(".d.ts") &&
  !SKIP.some((skip) => path.startsWith(skip));

function* files(dir: string): Generator<string> {
  for (const entry of readdirSync(join(ROOT, dir))) {
    const path = `${dir}/${entry}`;
    if (statSync(join(ROOT, path)).isDirectory()) yield* files(path);
    else if (isScanned(path)) yield path;
  }
}

/** Latin words a reader would notice: at least one word of two letters, and not an allowed name. */
export function looksEnglish(raw: string) {
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text || ALLOWED.has(text)) return false;
  return /[A-Za-z]{2,}/.test(text);
}

/** A string outside JSX that reads like copy rather than an identifier, a URL or a class list. */
export function looksLikeSentence(text: string) {
  if (/^(https?:|\/|#|\.|[a-z]+:)/.test(text) || text.includes("{"))
    return false;
  // date-fns patterns such as "MMMM d, yyyy"
  if (/^[dMyEHhmsa ,.:/-]+$/.test(text)) return false;
  const words = text.trim().split(/\s+/);
  return words.length >= 3 && /^[A-Z]/.test(text) && /[a-z]{3,}/.test(text);
}

/** Arguments to console.* and to thrown errors are for developers. */
function isDeveloperMessage(node: ts.Node) {
  const call = node.parent;
  if (ts.isNewExpression(call)) return true;
  return (
    ts.isCallExpression(call) &&
    call.expression.getText().startsWith("console.")
  );
}

type Finding = { file: string; line: number; text: string };

export function scan(file: string, source: string): Finding[] {
  const sf = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const findings: Finding[] = [];
  const report = (node: ts.Node, text: string) =>
    findings.push({
      file,
      line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1,
      text: text.replace(/\s+/g, " ").trim(),
    });

  const visit = (node: ts.Node): void => {
    if (ts.isJsxText(node) && looksEnglish(node.text)) report(node, node.text);
    else if (
      ts.isJsxAttribute(node) &&
      VISIBLE_PROPS.has(node.name.getText(sf)) &&
      node.initializer
    ) {
      const init = node.initializer;
      const literal = ts.isStringLiteral(init)
        ? init
        : ts.isJsxExpression(init) &&
            init.expression &&
            (ts.isStringLiteral(init.expression) ||
              ts.isNoSubstitutionTemplateLiteral(init.expression))
          ? init.expression
          : undefined;
      if (literal && looksEnglish(literal.text)) report(literal, literal.text);
    } else if (
      (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
      !ts.isImportDeclaration(node.parent) &&
      !ts.isJsxAttribute(node.parent) &&
      !isDeveloperMessage(node) &&
      (ts.isJsxExpression(node.parent)
        ? looksEnglish(node.text)
        : looksLikeSentence(node.text))
    )
      report(node, node.text);
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return findings;
}

if (import.meta.main) {
  console.assert(looksEnglish("Add to cart"), "English JSX text is flagged");
  console.assert(!looksEnglish("  Gear Verse "), "brand names pass");
  console.assert(!looksEnglish("·"), "punctuation passes");
  console.assert(!looksLikeSentence("flex items-center"), "class lists pass");
  console.assert(
    scan("x.tsx", `<p aria-label="Close menu">{t("a")}</p>`).length === 1,
    "a hardcoded aria-label is flagged",
  );
  console.assert(
    scan(
      "x.tsx",
      `toast.error("Something went wrong here"); <p className="Flex items center">{"Hi there"}</p>`,
    ).length === 2,
    "toast copy and a string child are flagged, a class list is not",
  );

  const findings = SCAN.flatMap((dir) =>
    [...files(dir)].flatMap((file) =>
      scan(
        relative(ROOT, join(ROOT, file)),
        readFileSync(join(ROOT, file), "utf8"),
      ),
    ),
  );
  for (const { file, line, text } of findings)
    console.log(`${file}:${line}  ${text}`);
  console.log(`\n${findings.length} hardcoded English strings`);
  process.exit(findings.length > 0 ? 1 : 0);
}
