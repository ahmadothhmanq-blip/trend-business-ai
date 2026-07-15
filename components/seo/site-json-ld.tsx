import { JsonLdScript } from "@/components/seo/json-ld-script";
import {
  faqPageJsonLd,
  graphJsonLd,
  organizationJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from "@/lib/seo/json-ld";
import { REF_FAQ } from "@/lib/constants/marketing-content";

/** Global marketing structured data for the homepage / site shell. */
export function SiteWideJsonLd() {
  return (
    <JsonLdScript
      id="site-wide-jsonld"
      data={graphJsonLd(
        organizationJsonLd(),
        websiteJsonLd(),
        softwareApplicationJsonLd(),
      )}
    />
  );
}

export function HomeFaqJsonLd() {
  return (
    <JsonLdScript
      id="home-faq-jsonld"
      data={faqPageJsonLd(REF_FAQ.map((item) => ({ question: item.question, answer: item.answer })))}
    />
  );
}
