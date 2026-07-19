/**
 * Website Analytics Engine — page views, sessions, conversions, traffic.
 */

export type AnalyticsDeviceType = "desktop" | "tablet" | "mobile";

export type AnalyticsEventName =
  | "page_view"
  | "session_start"
  | "button_click"
  | "conversion"
  | "cta_click"
  | "scroll"
  | "form_submit";

export type AnalyticsTrafficSource =
  | "direct"
  | "organic"
  | "social"
  | "referral"
  | "email"
  | "paid"
  | "unknown";

export type WebsiteAnalyticsEvent = {
  id: string;
  generationId: string;
  eventName: AnalyticsEventName;
  sessionId: string;
  visitorId: string;
  pagePath: string;
  referrer?: string | null;
  source: AnalyticsTrafficSource;
  device: AnalyticsDeviceType;
  /** Optional experiment assignment. */
  experimentId?: string | null;
  variantId?: string | null;
  /** Button / CTA label or element id. */
  target?: string | null;
  valueCents?: number | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type AnalyticsTimePoint = {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  conversions: number;
  clicks: number;
};

export type AnalyticsBreakdownItem = {
  key: string;
  label: string;
  count: number;
  share: number;
};

export type WebsiteAnalyticsSummary = {
  generationId: string;
  rangeDays: number;
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  buttonClicks: number;
  conversions: number;
  conversionRate: number;
  bounceRate: number;
  avgSessionPages: number;
  trafficSources: AnalyticsBreakdownItem[];
  devices: AnalyticsBreakdownItem[];
  topPages: AnalyticsBreakdownItem[];
  topButtons: AnalyticsBreakdownItem[];
  series: AnalyticsTimePoint[];
  conversionScore: number;
  seeded: boolean;
  updatedAt: string;
};

export type TrackAnalyticsInput = {
  generationId: string;
  eventName: AnalyticsEventName;
  sessionId?: string;
  visitorId?: string;
  pagePath?: string;
  referrer?: string | null;
  source?: AnalyticsTrafficSource;
  device?: AnalyticsDeviceType;
  experimentId?: string | null;
  variantId?: string | null;
  target?: string | null;
  valueCents?: number | null;
  metadata?: Record<string, unknown>;
};
