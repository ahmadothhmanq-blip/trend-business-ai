"use client";

import { FlagshipContactSection } from "@/lib/website/template-v2/flagship/contact-section";
import { SAAS_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

export function SaasEnterpriseContact(
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
      ui={SAAS_FLAGSHIP_UI}
      componentId="saas-enterprise-contact"
      id="contact"
      eyebrow="Contact sales"
      title="Book a personalized demo"
      subtitle="See how Northline fits your revenue stack. Enterprise teams get a dedicated solutions architect."
      email="sales@northline.io"
      phone="+1 (888) 555-0142"
      address="535 Mission Street, San Francisco, CA"
      submitLabel="Request demo"
      {...props}
    />
  );
}
