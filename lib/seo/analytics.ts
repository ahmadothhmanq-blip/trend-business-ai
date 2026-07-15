/**
 * Google / Bing readiness — verification + measurement IDs from env.
 * Scripts only load when IDs are present (no dead third-party calls).
 */
export function getAnalyticsVerification() {
  return {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined,
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() || undefined,
  };
}

export function getGoogleAnalyticsId() {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || undefined;
}

export function getGoogleTagManagerId() {
  return process.env.NEXT_PUBLIC_GTM_ID?.trim() || undefined;
}

export function isAnalyticsConfigured() {
  return Boolean(getGoogleAnalyticsId() || getGoogleTagManagerId());
}

export type AnalyticsConfig = {
  gaId?: string;
  gtmId?: string;
  googleVerification?: string;
  bingVerification?: string;
};

export function getAnalyticsConfig(): AnalyticsConfig {
  const verification = getAnalyticsVerification();
  return {
    gaId: getGoogleAnalyticsId(),
    gtmId: getGoogleTagManagerId(),
    googleVerification: verification.google,
    bingVerification: verification.bing,
  };
}
