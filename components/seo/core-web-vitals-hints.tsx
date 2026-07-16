/**
 * Core Web Vitals helpers — resource hints for marketing surfaces.
 * Keep lean: no third-party CWV scripts unless analytics already loads them.
 */
export function CoreWebVitalsHints() {
  return (
    <>
      <link rel="dns-prefetch" href="https://images.unsplash.com" />
      <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
    </>
  );
}
