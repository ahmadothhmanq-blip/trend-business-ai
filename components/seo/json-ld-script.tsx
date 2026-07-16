import type { JsonLd } from "@/lib/seo/json-ld";

/** Server-safe JSON-LD script injector. */
export function JsonLdScript({ data, id }: { data: JsonLd | JsonLd[]; id?: string }) {
  const payload = Array.isArray(data)
    ? {
        "@context": "https://schema.org",
        "@graph": data.map((node) => {
          const rest = { ...node };
          delete rest["@context"];
          return rest;
        }),
      }
    : data;

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
