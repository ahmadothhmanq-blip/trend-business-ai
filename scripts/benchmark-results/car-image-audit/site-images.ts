/**
 * Website Builder Image Engine — generated site imagery.
 * Semantic slots: hero, gallery, about, features, team, products, testimonials, backgrounds.
 */

export const HERO_IMAGE = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90";
export const PRODUCT_IMAGE = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90";
export const SERVICE_IMAGE = "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=1920&q=88";
export const BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=2400&q=90";
export const ABOUT_IMAGE = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=88";
export const BRAND_IMAGE = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90";
export const SECTION_IMAGES = ["https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=88","https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=88"] as const;
export const FEATURE_IMAGES = ["https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=88","https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=88"] as const;
export const TEAM_IMAGES = ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=88","https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1600&q=88","https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=1600&q=88","https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1600&q=88"] as const;
export const GALLERY_IMAGES = ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90"] as const;
export const TESTIMONIAL_IMAGES = ["https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=960&q=88","https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=960&q=88","https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=960&q=88","https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=960&q=88","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=960&q=88","https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=960&q=88"] as const;

export type ImageSlotKind =
  | "hero"
  | "gallery"
  | "about"
  | "features"
  | "team"
  | "products"
  | "testimonials"
  | "backgrounds";

export type SiteImageMeta = {
  id: string;
  role: string;
  name: string;
  alt: string;
  url: string | null;
  status: string;
  purpose?: string;
  section?: string;
  style?: string;
  prompt?: string;
  provider?: string;
  artDirection?: string;
  slot?: ImageSlotKind;
  objectPosition?: string;
  isUserOverride?: boolean;
};

export const SITE_IMAGES: SiteImageMeta[] = [
  {
    "id": "hero",
    "role": "hero",
    "name": "hero-Navbar",
    "alt": "Modern luxury sports car in red showcased in a dramatic minimalist showroom with blue accent lighting",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "hero",
    "section": "Navbar",
    "style": "modern",
    "prompt": "A wide cinematic hero shot of a sleek, modern luxury sports car in a deep crimson red (#C8102E) parked in a minimalist contemporary space with polished dark concrete floor and subtle cool blue accent lighting (#00A8E8). The car is angled slightly toward the camera, headlights gleaming, with sharp lines reflecting the high-performance design. Composition uses a low-angle wide lens, with generous negative space on the left side for textual overlay. Lighting is premium commercial: soft overhead spotlights creating balanced highlights and gentle reflections, with a moody but clean atmosphere. Ultra-realistic professional automotive photography, high detail, natural-looking materials, crisp focus, no text, no logo, no watermark.",
    "provider": "premium-stock",
    "artDirection": "hero: modern mood for Target customers · wide cinematic eye-level or slight low angle"
  },
  {
    "id": "product",
    "role": "product",
    "name": "product-features",
    "alt": "Close-up of sculpted car fender and alloy wheel highlighting performance design details",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "product",
    "section": "features",
    "style": "modern",
    "prompt": "A tight three-quarter detail shot of a high-performance vehicle's sculpted front fender and aerodynamic alloy wheel, finished in matte charcoal gray with crimson brake calipers. The car is parked in a clean, bright studio with soft gradient background supporting modern editorial style. Focus is on the precision of the bodywork and the advanced LED headlamp technology. Lighting is bright and evenly diffused with a subtle rim light to emphasize contours. Composition is square-crop ready with the subject filling the frame from lower left corner, leaving upper right space for copy. Professional commercial automotive photography, ultra sharp, high resolution, no text, no logo, no watermark.",
    "provider": "premium-stock",
    "artDirection": "product: modern mood for Target customers · three-quarter product angle, eye-level"
  },
  {
    "id": "service",
    "role": "service",
    "name": "service-services",
    "alt": "Professional technician using a digital tablet while inspecting a luxury car engine in a modern service workshop",
    "url": "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=1920&q=88",
    "status": "generated",
    "purpose": "service",
    "section": "services",
    "style": "modern",
    "prompt": "An experienced automotive technician in modern dark uniform and protective gloves carefully inspecting the engine bay of a luxury coupe in a brightly lit, clean dealership service workshop. The scene is authentic and industry-specific: the technician uses a digital diagnostic tablet, with soft-focus high-end vehicles in the background. Camera captures an environmental portrait at eye level, conveying professionalism and advanced service quality. The lighting is crisp and commercial with balanced highlights on the car's polished surfaces. Composition is a mid-shot with a clear focal point on the interaction between technician and vehicle. Photorealistic, editorial quality, no text, no logo, no watermark.",
    "provider": "premium-stock",
    "artDirection": "service: modern mood for Target customers · environmental portrait or craft close-up at eye level"
  },
  {
    "id": "background",
    "role": "background",
    "name": "background image",
    "alt": "Premium background photography",
    "url": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "background",
    "style": "premium-stock",
    "prompt": "Semantic background photography",
    "provider": "premium-stock"
  },
  {
    "id": "iie-fill-section-3",
    "role": "section",
    "name": "section image",
    "alt": "Apex Motors — Professional business hero with clear value proposition visual context for features",
    "url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=88",
    "status": "generated",
    "purpose": "section",
    "style": "premium-stock",
    "prompt": "luxury vehicle exterior for Apex Motors (automotive). Layout: square-card. Camera: supporting mid-shot with clear focal point. Composition: single strong subject, intentional crop for card layout. Professional photography, ultra realistic, premium quality, high detail, natural lighting, correct camera angle, website hero quality, editorial quality, high resolution, clean background, no watermark, no text, no logo. Business type: Automotive / Dealership. Offer: High-performance vehicles with cutting-edge design and technology. Brand personality: modern. Design tone: Modern tech tone, crisp lines, contemporary lighting. Visual style: modern clean photography, sharp focus, contemporary composition, bright balanced light, premium commercial finish. Art direction: Photography style: luxury vehicle exterior. Camera: supporting mid-shot. Lighting: premium commercial lighting, balanced highlights, agency-grade exposure. Mood: modern mood for Target customers. Colors: Palette harmony near #C8102E / #111827. Composition: section-matched subject with clear focal point. Color palette mood: #C8102E, #111827, #00A8E8. Target audience: Target customers. Professional photography, ultra realistic, premium quality, high detail, natural lighting, correct camera angle, website hero quality, editorial quality, high resolution, clean background, no watermark, no text, no logo.",
    "provider": "premium-stock"
  },
  {
    "id": "testimonial-1",
    "role": "testimonial",
    "name": "testimonial image 1",
    "alt": "Premium testimonial photography",
    "url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=960&q=88",
    "status": "generated",
    "purpose": "testimonial",
    "style": "premium-stock",
    "prompt": "Semantic testimonial photography",
    "provider": "premium-stock"
  },
  {
    "id": "testimonial-2",
    "role": "testimonial",
    "name": "testimonial image 2",
    "alt": "Premium testimonial photography",
    "url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=960&q=88",
    "status": "generated",
    "purpose": "testimonial",
    "style": "premium-stock",
    "prompt": "Semantic testimonial photography",
    "provider": "premium-stock"
  },
  {
    "id": "hero-1",
    "role": "hero",
    "name": "hero hero-1",
    "alt": "Automotive hero photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "hero",
    "section": "hero",
    "style": "automotive",
    "prompt": "automotive hero",
    "provider": "premium-stock"
  },
  {
    "id": "gallery-1",
    "role": "gallery",
    "name": "gallery gallery-1",
    "alt": "Automotive gallery photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "gallery",
    "section": "gallery",
    "style": "automotive",
    "prompt": "automotive gallery",
    "provider": "library"
  },
  {
    "id": "gallery-2",
    "role": "gallery",
    "name": "gallery gallery-2",
    "alt": "Automotive gallery photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "gallery",
    "section": "gallery",
    "style": "automotive",
    "prompt": "automotive gallery",
    "provider": "library"
  },
  {
    "id": "gallery-3",
    "role": "gallery",
    "name": "gallery gallery-3",
    "alt": "Automotive gallery photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "gallery",
    "section": "gallery",
    "style": "automotive",
    "prompt": "automotive gallery",
    "provider": "library"
  },
  {
    "id": "gallery-4",
    "role": "gallery",
    "name": "gallery gallery-4",
    "alt": "Automotive gallery photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "gallery",
    "section": "gallery",
    "style": "automotive",
    "prompt": "automotive gallery",
    "provider": "library"
  },
  {
    "id": "gallery-5",
    "role": "gallery",
    "name": "gallery gallery-5",
    "alt": "Automotive gallery photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "gallery",
    "section": "gallery",
    "style": "automotive",
    "prompt": "automotive gallery",
    "provider": "library"
  },
  {
    "id": "gallery-6",
    "role": "gallery",
    "name": "gallery gallery-6",
    "alt": "Automotive gallery photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "gallery",
    "section": "gallery",
    "style": "automotive",
    "prompt": "automotive gallery",
    "provider": "library"
  },
  {
    "id": "gallery-7",
    "role": "gallery",
    "name": "gallery gallery-7",
    "alt": "Automotive gallery photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "gallery",
    "section": "gallery",
    "style": "automotive",
    "prompt": "automotive gallery",
    "provider": "library"
  },
  {
    "id": "gallery-8",
    "role": "gallery",
    "name": "gallery gallery-8",
    "alt": "Automotive gallery photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "gallery",
    "section": "gallery",
    "style": "automotive",
    "prompt": "automotive gallery",
    "provider": "library"
  },
  {
    "id": "gallery-9",
    "role": "gallery",
    "name": "gallery gallery-9",
    "alt": "Automotive gallery photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "gallery",
    "section": "gallery",
    "style": "automotive",
    "prompt": "automotive gallery",
    "provider": "library"
  },
  {
    "id": "gallery-10",
    "role": "gallery",
    "name": "gallery gallery-10",
    "alt": "Automotive gallery photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "gallery",
    "section": "gallery",
    "style": "automotive",
    "prompt": "automotive gallery",
    "provider": "library"
  },
  {
    "id": "gallery-11",
    "role": "gallery",
    "name": "gallery gallery-11",
    "alt": "Automotive gallery photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "gallery",
    "section": "gallery",
    "style": "automotive",
    "prompt": "automotive gallery",
    "provider": "library"
  },
  {
    "id": "gallery-12",
    "role": "gallery",
    "name": "gallery gallery-12",
    "alt": "Automotive gallery photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "gallery",
    "section": "gallery",
    "style": "automotive",
    "prompt": "automotive gallery",
    "provider": "library"
  },
  {
    "id": "about-1",
    "role": "section",
    "name": "about about-1",
    "alt": "Automotive about photography",
    "url": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1920&q=88",
    "status": "generated",
    "purpose": "section",
    "section": "about",
    "style": "automotive",
    "prompt": "automotive about",
    "provider": "premium-stock"
  },
  {
    "id": "about-2",
    "role": "section",
    "name": "about about-2",
    "alt": "Automotive about photography",
    "url": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1920&q=88",
    "status": "generated",
    "purpose": "section",
    "section": "about",
    "style": "automotive",
    "prompt": "automotive about",
    "provider": "library"
  },
  {
    "id": "about-3",
    "role": "section",
    "name": "about about-3",
    "alt": "Automotive about photography",
    "url": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1920&q=88",
    "status": "generated",
    "purpose": "section",
    "section": "about",
    "style": "automotive",
    "prompt": "automotive about",
    "provider": "library"
  },
  {
    "id": "features-1",
    "role": "service",
    "name": "features features-1",
    "alt": "Automotive features photography",
    "url": "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1920&q=88",
    "status": "generated",
    "purpose": "service",
    "section": "features",
    "style": "automotive",
    "prompt": "automotive features",
    "provider": "premium-stock"
  },
  {
    "id": "features-2",
    "role": "service",
    "name": "features features-2",
    "alt": "Automotive features photography",
    "url": "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1920&q=88",
    "status": "generated",
    "purpose": "service",
    "section": "features",
    "style": "automotive",
    "prompt": "automotive features",
    "provider": "premium-stock"
  },
  {
    "id": "features-3",
    "role": "service",
    "name": "features features-3",
    "alt": "Automotive features photography",
    "url": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1920&q=88",
    "status": "generated",
    "purpose": "service",
    "section": "features",
    "style": "automotive",
    "prompt": "automotive features",
    "provider": "library"
  },
  {
    "id": "features-4",
    "role": "service",
    "name": "features features-4",
    "alt": "Automotive features photography",
    "url": "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1920&q=88",
    "status": "generated",
    "purpose": "service",
    "section": "features",
    "style": "automotive",
    "prompt": "automotive features",
    "provider": "library"
  },
  {
    "id": "features-5",
    "role": "service",
    "name": "features features-5",
    "alt": "Automotive features photography",
    "url": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1920&q=88",
    "status": "generated",
    "purpose": "service",
    "section": "features",
    "style": "automotive",
    "prompt": "automotive features",
    "provider": "library"
  },
  {
    "id": "features-6",
    "role": "service",
    "name": "features features-6",
    "alt": "Automotive features photography",
    "url": "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1920&q=88",
    "status": "generated",
    "purpose": "service",
    "section": "features",
    "style": "automotive",
    "prompt": "automotive features",
    "provider": "library"
  },
  {
    "id": "team-1",
    "role": "section",
    "name": "team team-1",
    "alt": "Automotive team photography",
    "url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1920&q=88",
    "status": "generated",
    "purpose": "section",
    "section": "team",
    "style": "automotive",
    "prompt": "automotive team",
    "provider": "premium-stock"
  },
  {
    "id": "team-2",
    "role": "section",
    "name": "team team-2",
    "alt": "Automotive team photography",
    "url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=1920&q=88",
    "status": "generated",
    "purpose": "section",
    "section": "team",
    "style": "automotive",
    "prompt": "automotive team",
    "provider": "premium-stock"
  },
  {
    "id": "team-3",
    "role": "section",
    "name": "team team-3",
    "alt": "Automotive team photography",
    "url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1920&q=88",
    "status": "generated",
    "purpose": "section",
    "section": "team",
    "style": "automotive",
    "prompt": "automotive team",
    "provider": "premium-stock"
  },
  {
    "id": "team-4",
    "role": "section",
    "name": "team team-4",
    "alt": "Automotive team photography",
    "url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1920&q=88",
    "status": "generated",
    "purpose": "section",
    "section": "team",
    "style": "automotive",
    "prompt": "automotive team",
    "provider": "premium-stock"
  },
  {
    "id": "products-1",
    "role": "product",
    "name": "products products-1",
    "alt": "Automotive products photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "product",
    "section": "products",
    "style": "automotive",
    "prompt": "automotive products",
    "provider": "premium-stock"
  },
  {
    "id": "products-2",
    "role": "product",
    "name": "products products-2",
    "alt": "Automotive products photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "product",
    "section": "products",
    "style": "automotive",
    "prompt": "automotive products",
    "provider": "library"
  },
  {
    "id": "products-3",
    "role": "product",
    "name": "products products-3",
    "alt": "Automotive products photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "product",
    "section": "products",
    "style": "automotive",
    "prompt": "automotive products",
    "provider": "library"
  },
  {
    "id": "products-4",
    "role": "product",
    "name": "products products-4",
    "alt": "Automotive products photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "product",
    "section": "products",
    "style": "automotive",
    "prompt": "automotive products",
    "provider": "library"
  },
  {
    "id": "products-5",
    "role": "product",
    "name": "products products-5",
    "alt": "Automotive products photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "product",
    "section": "products",
    "style": "automotive",
    "prompt": "automotive products",
    "provider": "library"
  },
  {
    "id": "products-6",
    "role": "product",
    "name": "products products-6",
    "alt": "Automotive products photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "product",
    "section": "products",
    "style": "automotive",
    "prompt": "automotive products",
    "provider": "library"
  },
  {
    "id": "products-7",
    "role": "product",
    "name": "products products-7",
    "alt": "Automotive products photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "product",
    "section": "products",
    "style": "automotive",
    "prompt": "automotive products",
    "provider": "library"
  },
  {
    "id": "products-8",
    "role": "product",
    "name": "products products-8",
    "alt": "Automotive products photography",
    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "product",
    "section": "products",
    "style": "automotive",
    "prompt": "automotive products",
    "provider": "library"
  },
  {
    "id": "testimonials-1",
    "role": "testimonial",
    "name": "testimonials testimonials-1",
    "alt": "Automotive testimonials photography",
    "url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=960&q=88",
    "status": "generated",
    "purpose": "testimonial",
    "section": "testimonials",
    "style": "automotive",
    "prompt": "automotive testimonials",
    "provider": "premium-stock"
  },
  {
    "id": "testimonials-2",
    "role": "testimonial",
    "name": "testimonials testimonials-2",
    "alt": "Automotive testimonials photography",
    "url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=960&q=88",
    "status": "generated",
    "purpose": "testimonial",
    "section": "testimonials",
    "style": "automotive",
    "prompt": "automotive testimonials",
    "provider": "premium-stock"
  },
  {
    "id": "testimonials-3",
    "role": "testimonial",
    "name": "testimonials testimonials-3",
    "alt": "Automotive testimonials photography",
    "url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=960&q=88",
    "status": "generated",
    "purpose": "testimonial",
    "section": "testimonials",
    "style": "automotive",
    "prompt": "automotive testimonials",
    "provider": "premium-stock"
  },
  {
    "id": "testimonials-4",
    "role": "testimonial",
    "name": "testimonials testimonials-4",
    "alt": "Automotive testimonials photography",
    "url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=960&q=88",
    "status": "generated",
    "purpose": "testimonial",
    "section": "testimonials",
    "style": "automotive",
    "prompt": "automotive testimonials",
    "provider": "premium-stock"
  },
  {
    "id": "backgrounds-1",
    "role": "background",
    "name": "backgrounds backgrounds-1",
    "alt": "Automotive backgrounds photography",
    "url": "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "background",
    "section": "backgrounds",
    "style": "automotive",
    "prompt": "automotive backgrounds",
    "provider": "premium-stock"
  },
  {
    "id": "backgrounds-2",
    "role": "background",
    "name": "backgrounds backgrounds-2",
    "alt": "Automotive backgrounds photography",
    "url": "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "background",
    "section": "backgrounds",
    "style": "automotive",
    "prompt": "automotive backgrounds",
    "provider": "library"
  },
  {
    "id": "backgrounds-3",
    "role": "background",
    "name": "backgrounds backgrounds-3",
    "alt": "Automotive backgrounds photography",
    "url": "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "background",
    "section": "backgrounds",
    "style": "automotive",
    "prompt": "automotive backgrounds",
    "provider": "library"
  },
  {
    "id": "backgrounds-4",
    "role": "background",
    "name": "backgrounds backgrounds-4",
    "alt": "Automotive backgrounds photography",
    "url": "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=2400&q=90",
    "status": "generated",
    "purpose": "background",
    "section": "backgrounds",
    "style": "automotive",
    "prompt": "automotive backgrounds",
    "provider": "library"
  },
  {
    "id": "cta-1",
    "role": "section",
    "name": "cta cta-1",
    "alt": "Automotive cta photography",
    "url": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1920&q=88",
    "status": "generated",
    "purpose": "section",
    "section": "cta",
    "style": "automotive",
    "prompt": "automotive cta",
    "provider": "premium-stock"
  },
  {
    "id": "cta-2",
    "role": "section",
    "name": "cta cta-2",
    "alt": "Automotive cta photography",
    "url": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1920&q=88",
    "status": "generated",
    "purpose": "section",
    "section": "cta",
    "style": "automotive",
    "prompt": "automotive cta",
    "provider": "library"
  }
];

export function siteImagePool(): string[] {
  return [
    HERO_IMAGE,
    PRODUCT_IMAGE,
    SERVICE_IMAGE,
    BACKGROUND_IMAGE,
    ABOUT_IMAGE,
    ...SECTION_IMAGES,
    ...FEATURE_IMAGES,
    ...TEAM_IMAGES,
    ...GALLERY_IMAGES,
    ...TESTIMONIAL_IMAGES,
  ].filter((u): u is string => Boolean(u));
}

export function slotImages(kind: ImageSlotKind): readonly string[] {
  switch (kind) {
    case "hero":
      return [HERO_IMAGE];
    case "gallery":
      return GALLERY_IMAGES;
    case "about":
      return SECTION_IMAGES.length ? SECTION_IMAGES : [ABOUT_IMAGE];
    case "features":
      return FEATURE_IMAGES.length ? FEATURE_IMAGES : SECTION_IMAGES;
    case "team":
      return TEAM_IMAGES;
    case "products":
      return [PRODUCT_IMAGE, ...GALLERY_IMAGES].filter(Boolean);
    case "testimonials":
      return TESTIMONIAL_IMAGES;
    case "backgrounds":
      return [BACKGROUND_IMAGE, HERO_IMAGE].filter(Boolean);
    default:
      return siteImagePool();
  }
}

export function imageByRole(role: string): string | null {
  const hit = SITE_IMAGES.find((i) => i.role === role && i.url);
  return hit?.url ?? null;
}

function sharpenUnsplashUrl(url: string, role: string): string {
  if (!url?.trim()) return "";
  const trimmed = url.trim();
  if (!trimmed.includes("images.unsplash.com")) return trimmed;
  const base = trimmed.split("?")[0]!;
  const w =
    role === "hero" || role === "background"
      ? 2400
      : role === "testimonial" || role === "team"
        ? 960
        : 1920;
  const q = w >= 2400 ? 90 : 88;
  return `${base}?auto=format&fit=crop&w=${w}&q=${q}`;
}

export function resolveSlotImage(
  kind: ImageSlotKind,
  index = 0,
  preferred?: string | null,
): string {
  if (preferred?.trim()) return sharpenUnsplashUrl(preferred.trim(), kind);
  const images = slotImages(kind);
  if (images.length > 0) {
    return sharpenUnsplashUrl(images[index % images.length]!, kind);
  }
  return resolveSiteImage(null, index);
}

/** Resolve a photographic URL for a slot — never returns empty string when pool has images. */
export function resolveSiteImage(
  preferred?: string | null,
  index = 0,
): string {
  if (preferred?.trim()) {
    return sharpenUnsplashUrl(preferred.trim(), index === 0 ? "hero" : "section");
  }
  const pool = siteImagePool();
  if (!pool.length) return "";
  return sharpenUnsplashUrl(pool[index % pool.length]!, "section");
}
