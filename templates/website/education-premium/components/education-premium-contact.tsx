"use client";

import { FlagshipContactSection } from "@/lib/website/template-v2/flagship/contact-section";
import { EDUCATION_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

export function EducationPremiumContact(
  props: Partial<{
    eyebrow: string;
    title: string;
    subtitle: string;
    email: string;
    phone: string;
    address: string;
    submitLabel: string;
  }> = {},
) {
  return (
    <FlagshipContactSection
      ui={EDUCATION_FLAGSHIP_UI}
      componentId="education-premium-contact"
      id="contact"
      eyebrow="Admissions"
      title="Begin your application journey"
      subtitle="Connect with our admissions team to learn about programs, financial aid, and campus visit opportunities."
      email="admissions@scholarshall.edu"
      phone="+1 (617) 555-0142"
      address="1 University Quadrangle, Cambridge, MA 02138"
      submitLabel="Request information"
      {...props}
    />
  );
}
