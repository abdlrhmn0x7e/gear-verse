type JsonLdData = Record<string, unknown>;

/**
 * A JSON-LD script. `<` is escaped so a value can't close the tag, as in the
 * Next.js JSON-LD guide.
 */
export function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
