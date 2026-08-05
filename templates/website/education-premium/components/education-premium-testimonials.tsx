"use client";

import {
  FlagshipTestimonialsSection,
  type FlagshipTestimonial,
} from "@/lib/website/template-v2/flagship/testimonials-section";
import { EDUCATION_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

const EDUCATION_TESTIMONIALS: FlagshipTestimonial[] = [
  {
    quote:
      "Scholar's Hall gave me the intellectual foundation and research experience to pursue my PhD at Oxford. The faculty genuinely invested in my growth as a scholar.",
    name: "Elena Vasquez",
    role: "Class of 2024",
    company: "Rhodes Scholar",
  },
  {
    quote:
      "The interdisciplinary approach here prepared me to lead a team at a Fortune 500 company. I learned to think critically and communicate with precision.",
    name: "James Okonkwo",
    role: "MBA Graduate",
    company: "McKinsey & Company",
  },
  {
    quote:
      "As a first-generation student, the mentorship and financial aid I received transformed my life. This university believes in every student's potential.",
    name: "Sarah Chen",
    role: "Class of 2023",
    company: "Fulbright Fellow",
  },
];

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: FlagshipTestimonial[];
};

export function EducationPremiumTestimonials({
  eyebrow = "Student voices",
  title = "Stories from our scholars",
  subtitle = "Alumni and current students share how Scholar's Hall shaped their academic journey and career path.",
  items = EDUCATION_TESTIMONIALS,
}: Props) {
  return (
    <FlagshipTestimonialsSection
      ui={EDUCATION_FLAGSHIP_UI}
      componentId="education-premium-testimonials"
      id="testimonials"
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      items={items}
    />
  );
}
