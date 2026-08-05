"use client";

import {
  FlagshipTestimonialsSection,
  type FlagshipTestimonial,
} from "@/lib/website/template-v2/flagship/testimonials-section";
import { SAAS_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: FlagshipTestimonial[];
};

export function SaasEnterpriseTestimonials(props: Props) {
  return (
    <FlagshipTestimonialsSection
      ui={SAAS_FLAGSHIP_UI}
      componentId="saas-enterprise-testimonials"
      id="testimonials"
      {...props}
    />
  );
}
