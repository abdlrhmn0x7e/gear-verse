/**
 * Rewrites physical-direction Tailwind utilities (ml-2, left-0, text-right, rounded-tl-lg, border-l, ...) to their
 * logical equivalents (ms-2, start-0, text-end, rounded-ss-lg, border-s, ...) so the storefront mirrors under dir="rtl".
 * In LTR every logical utility resolves to the same physical property, so English renders identically.
 *
 * Rerunnable and idempotent: `bun scripts/logical-direction-codemod.ts` (add --dry to only report).
 * `bun scripts/logical-direction-codemod.ts --test` runs the self-check.
 *
 * Tailwind v4's space-x-* and divide-x-* already use margin-inline / border-inline, so they are left alone.
 * The admin (src/app/admin) stays English-only and is not touched.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";

const ROOTS = ["src/app/(public)", "src/components"];
const FILES = ["src/app/global-error.tsx", "src/app/not-found.tsx"];

const SIDE: Record<string, string> = { l: "s", r: "e" };
const CORNER: Record<string, string> = {
  l: "s",
  r: "e",
  tl: "ss",
  tr: "se",
  bl: "es",
  br: "ee",
};
const WORD: Record<string, string> = { left: "start", right: "end" };

// values a spacing/inset utility takes, so strings like "left-panel" or "pl-PL" never match
const SPACING = String.raw`(?:\d+(?:\.\d+)?|\d+/\d+|px|full|auto|\[[^\s]+\]|\([^\s]+\))`;
const RADIUS = String.raw`(?:-(?:none|xs|sm|md|lg|xl|[234]xl|full|\[[^\s]+\]|\([^\s]+\)))?`;
const BORDER = String.raw`(?:-(?:\d+|[a-z]+(?:-\d+)?(?:/\d+)?|\[[^\s]+\]|\([^\s]+\)))?`;

type Rule = {
  family: string;
  pattern: RegExp;
  replace: (...groups: string[]) => string;
};

const RULES: Rule[] = [
  {
    family: "margin (ml/mr)",
    pattern: new RegExp(`^m([lr])-(${SPACING})$`),
    replace: (s, v) => `m${SIDE[s]}-${v}`,
  },
  {
    family: "padding (pl/pr)",
    pattern: new RegExp(`^p([lr])-(${SPACING})$`),
    replace: (s, v) => `p${SIDE[s]}-${v}`,
  },
  {
    family: "scroll margin/padding",
    pattern: new RegExp(`^scroll-([mp])([lr])-(${SPACING})$`),
    replace: (k, s, v) => `scroll-${k}${SIDE[s]}-${v}`,
  },
  {
    family: "inset (left/right)",
    pattern: new RegExp(`^(left|right)-(${SPACING})$`),
    replace: (w, v) => `${WORD[w]}-${v}`,
  },
  {
    family: "text-align",
    pattern: /^text-(left|right)$/,
    replace: (w) => `text-${WORD[w]}`,
  },
  {
    family: "rounded corners",
    pattern: new RegExp(`^rounded-(tl|tr|bl|br|l|r)(${RADIUS})$`),
    replace: (c, v) => `rounded-${CORNER[c]}${v}`,
  },
  {
    family: "border side",
    pattern: new RegExp(`^border-([lr])(${BORDER})$`),
    replace: (s, v) => `border-${SIDE[s]}${v}`,
  },
  {
    family: "float/clear",
    pattern: /^(float|clear)-(left|right)$/,
    replace: (k, w) => `${k}-${WORD[w]}`,
  },
];

// left-1/2 + -translate-x-1/2 centres the element in either direction; start-1/2 would push it off-centre in RTL
const CENTERING = /translate-x-(?:1\/2|\[-?50%\])/;
const CENTER_VALUE = /^(?:left|right)-(?:1\/2|\[50%\])$/;

/** Splits "md:hover:-ml-2!" into its variant prefix, important/negative markers and the bare utility. */
function rewriteToken(token: string, literal: string): [string, string] | null {
  let depth = 0;
  let split = -1;
  for (let i = 0; i < token.length; i++) {
    const ch = token[i];
    if (ch === "[" || ch === "(") depth++;
    else if (ch === "]" || ch === ")") depth--;
    else if (ch === ":" && depth === 0) split = i;
  }
  const variants = token.slice(0, split + 1);
  const m = /^(!?)(-?)(.*?)(!?)$/.exec(token.slice(split + 1))!;
  const [, bang, neg, utility, trailingBang] = m;
  if (!utility || utility.includes("safe-area-inset")) return null; // device insets are physical
  if (CENTER_VALUE.test(utility) && CENTERING.test(literal)) return null;
  for (const rule of RULES) {
    const match = rule.pattern.exec(utility);
    if (match)
      return [
        rule.family,
        `${variants}${bang}${neg}${rule.replace(...match.slice(1))}${trailingBang}`,
      ];
  }
  return null;
}

type Edit = { start: number; end: number; text: string };

function rewriteSource(
  path: string,
  source: string,
  counts: Map<string, number>,
) {
  const file = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const edits: Edit[] = [];

  const visitLiteral = (start: number, end: number) => {
    const text = source.slice(start, end);
    const out = text.replace(/[^\s]+/g, (token) => {
      const result = rewriteToken(token, text);
      if (!result) return token;
      counts.set(result[0], (counts.get(result[0]) ?? 0) + 1);
      return result[1];
    });
    if (out !== text) edits.push({ start, end, text: out });
  };

  const visit = (node: ts.Node) => {
    if (
      ts.isImportDeclaration(node) ||
      ts.isExportDeclaration(node) ||
      ts.isExternalModuleReference(node)
    )
      return;
    const start = node.getStart(file);
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
      visitLiteral(start + 1, node.end - 1);
    else if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node))
      visitLiteral(start + 1, node.end - 2);
    else if (ts.isTemplateTail(node)) visitLiteral(start + 1, node.end - 1);
    ts.forEachChild(node, visit);
  };
  visit(file);

  let out = source;
  for (const e of edits.sort((a, b) => b.start - a.start))
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return out;
}

function selfCheck() {
  const counts = new Map<string, number>();
  const cases: [string, string][] = [
    [
      `<div className="ml-2 mr-auto pl-4 pr-[3px] -ml-px" />`,
      `<div className="ms-2 me-auto ps-4 pe-[3px] -ms-px" />`,
    ],
    [
      `cn("md:hover:left-0 right-1/2", x && "text-right")`,
      `cn("md:hover:start-0 end-1/2", x && "text-end")`,
    ],
    [
      `cva("rounded-tl-lg rounded-r border-l-2 border-r-primary/50 border-l")`,
      `cva("rounded-ss-lg rounded-e border-s-2 border-e-primary/50 border-s")`,
    ],
    [
      "`data-[side=left]:pl-2 ${a} group-hover:!mr-1 float-left scroll-ml-4`",
      "`data-[side=left]:ps-2 ${a} group-hover:!me-1 float-start scroll-ms-4`",
    ],
    [
      `"absolute left-1/2 -translate-x-1/2"`,
      `"absolute left-1/2 -translate-x-1/2"`,
    ],
    [
      `"pl-[env(safe-area-inset-left)] left-panel pl-PL right"`,
      `"pl-[env(safe-area-inset-left)] left-panel pl-PL right"`,
    ],
    [`import x from "./left-0";`, `import x from "./left-0";`],
  ];
  for (const [input, expected] of cases) {
    const actual = rewriteSource("check.tsx", input, counts);
    if (actual !== expected)
      throw new Error(
        `self-check failed\n  in:  ${input}\n  out: ${actual}\n  exp: ${expected}`,
      );
    if (rewriteSource("check.tsx", actual, counts) !== actual)
      throw new Error(`not idempotent: ${actual}`);
  }
  console.log(`self-check passed (${cases.length} cases)`);
}

function main() {
  if (process.argv.includes("--test")) return selfCheck();
  const dry = process.argv.includes("--dry");
  const paths = [...FILES];
  for (const root of ROOTS)
    for (const p of readdirSync(root, { recursive: true, encoding: "utf8" }))
      if (/\.tsx?$/.test(p)) paths.push(`${root}/${p}`);

  const counts = new Map<string, number>();
  let changed = 0;
  for (const path of paths.sort()) {
    const source = readFileSync(path, "utf8");
    const out = rewriteSource(path, source, counts);
    if (out === source) continue;
    changed++;
    if (!dry) writeFileSync(path, out);
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  for (const rule of RULES)
    console.log(`${rule.family.padEnd(24)} ${counts.get(rule.family) ?? 0}`);
  console.log(
    `${"total".padEnd(24)} ${total} in ${changed} of ${paths.length} files${dry ? " (dry run)" : ""}`,
  );
}

main();
