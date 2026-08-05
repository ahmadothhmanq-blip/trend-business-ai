"use client";

import { FlagshipAboutSection } from "@/lib/website/template-v2/flagship/about-section";
import { EDUCATION_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function EducationPremiumAbout({
  eyebrow = "Our heritage",
  title = "A century of scholarly distinction",
  subtitle,
  body = "Founded in 1892, Scholar's Hall has cultivated generations of scholars, innovators, and civic leaders. Our Gothic quadrangles and state-of-the-art research facilities embody a commitment to both tradition and progress.",
  imageUrl,
  highlights = [
    "Top 50 national research university",
    "12:1 student-faculty ratio",
    "94% graduate placement within 6 months",
  ],
  primaryCta = "Schedule a campus visit",
}: Props) {
  return (
    <FlagshipAboutSection
      ui={EDUCATION_FLAGSHIP_UI}
      componentId="education-premium-about"
      id="about"
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      body={body}
      imageUrl={imageUrl}
      highlights={highlights}
      primaryCta={primaryCta}
      primaryCtaHref="#contact"
      imageBadge="Est. 1892"
    />
  );
}
