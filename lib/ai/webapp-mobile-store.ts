import type { GeneratedProjectFile } from "@/lib/ai/types";

export type WebAppMobileStoreOptions = {
  title: string;
  /** npm package name slug, e.g. appointments-app */
  pkgName: string;
  /** Reverse-DNS id, e.g. com.example.appointments */
  appId?: string;
  /** Public HTTPS URL after production deploy (placeholder if unknown) */
  productionUrl?: string;
  primaryColor?: string;
};

function sanitizeAppId(pkgName: string): string {
  const slug = pkgName.replace(/[^a-z0-9]+/g, "").slice(0, 24) || "app";
  return `com.trendbusinessai.${slug}`;
}

function escapeMd(text: string): string {
  return text.replace(/[\\`*_{}[\]()#+.!-]/g, "\\$&");
}

/** Minimal installable PWA + Capacitor/TWA packaging for Google Play, App Store, and other stores. */
export function buildWebAppMobileStoreFiles(
  options: WebAppMobileStoreOptions,
): GeneratedProjectFile[] {
  const title = options.title.trim() || "Generated Application";
  const pkgName = options.pkgName.trim() || "generated-app";
  const appId = options.appId?.trim() || sanitizeAppId(pkgName);
  const productionUrl =
    options.productionUrl?.trim() || "https://YOUR_PRODUCTION_URL.example.com";
  const themeColor = options.primaryColor?.trim() || "#0f172a";

  const manifest = {
    name: title,
    short_name: title.slice(0, 12),
    description: `${title} — installable progressive web app`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: themeColor,
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/maskable-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };

  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="${title}">
  <rect width="512" height="512" rx="96" fill="${themeColor}"/>
  <text x="256" y="290" text-anchor="middle" font-family="system-ui,sans-serif" font-size="180" font-weight="700" fill="#ffffff">${title.charAt(0).toUpperCase()}</text>
</svg>`;

  const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="${title}">
  <rect width="512" height="512" fill="${themeColor}"/>
  <circle cx="256" cy="256" r="160" fill="#ffffff" opacity="0.15"/>
  <text x="256" y="290" text-anchor="middle" font-family="system-ui,sans-serif" font-size="180" font-weight="700" fill="#ffffff">${title.charAt(0).toUpperCase()}</text>
</svg>`;

  const storeReadme = `# Mobile store publishing — ${title}

This folder packages your web app for **Google Play**, **Apple App Store**, **Samsung Galaxy Store**, and **PWA install**.

## Before you publish

1. Deploy the Next.js app to a **public HTTPS URL** (Vercel, Railway, VPS, or Trend Business AI public host at \`/w/app/{slug}\`).
2. Replace \`YOUR_PRODUCTION_URL\` in \`capacitor.config.ts\` and \`twa-manifest.json\` with your live URL.
3. Replace placeholder icons in \`../public/icons/\` with **512×512 PNG** assets (required by Google Play Console).
4. Prepare store listing copy, screenshots, privacy policy URL, and content rating questionnaire.

## Google Play (Android)

**Option A — Trusted Web Activity (recommended for PWAs)**

\`\`\`bash
cd mobile-store
npm install
npm run android:twa:init
npm run android:twa:build
\`\`\`

Upload the generated \`.aab\` from \`android/app/build/outputs/\` to [Google Play Console](https://play.google.com/console).

**Option B — Capacitor native shell**

\`\`\`bash
cd mobile-store
npm install
npm run cap:init
npm run cap:add:android
npm run cap:sync
npm run cap:open:android
\`\`\`

Build a signed release bundle in Android Studio (**Build → Generate Signed Bundle / APK**).

See \`GOOGLE_PLAY.md\` for the full checklist.

## Apple App Store (iOS)

\`\`\`bash
cd mobile-store
npm install
npm run cap:init
npm run cap:add:ios
npm run cap:sync
npm run cap:open:ios
\`\`\`

Archive in Xcode and upload via App Store Connect. See \`APPLE_APP_STORE.md\`.

## Other stores

- **Samsung Galaxy Store** — submit the same Android \`.aab\` with Samsung Seller Portal.
- **Amazon Appstore** — Android APK/AAB with Fire device testing.
- **Huawei AppGallery** — Android bundle via AppGallery Connect.

## PWA (no store)

Users can install from Chrome/Safari when the app is served over HTTPS with a valid manifest (already included in \`public/manifest.webmanifest\`).
`;

  const googlePlayMd = `# Google Play publishing checklist — ${escapeMd(title)}

## Requirements

- [ ] Google Play Developer account ($25 one-time)
- [ ] Public HTTPS production URL
- [ ] Privacy policy URL (required)
- [ ] App icon 512×512 PNG (no transparency for Play)
- [ ] Feature graphic 1024×500
- [ ] Phone screenshots (min 2)
- [ ] Content rating questionnaire
- [ ] Target API level meets Play policy

## Package name

\`${appId}\`

## Build AAB (TWA)

\`\`\`bash
cd mobile-store
npm install
npm run android:twa:init
npm run android:twa:build
\`\`\`

## Play Console steps

1. Create app → set default language
2. Store listing → title, short/full description, graphics
3. App content → privacy policy, ads declaration, content rating
4. Release → Production → upload AAB → review
5. Enable **Play App Signing**

## Notes

- TWA wraps your PWA in a Chrome Custom Tab with no browser UI — users get a native-like experience.
- Ensure \`assetlinks.json\` is served at \`/.well-known/assetlinks.json\` on your production domain (generated in \`public/.well-known/\`).
`;

  const appleMd = `# Apple App Store publishing checklist — ${escapeMd(title)}

## Requirements

- [ ] Apple Developer Program ($99/year)
- [ ] Public HTTPS production URL (Capacitor WebView loads your deployed app)
- [ ] App icon 1024×1024 PNG (no alpha)
- [ ] iPhone screenshots (6.7" and 6.5" recommended)
- [ ] Privacy policy URL
- [ ] App Privacy details in App Store Connect

## Bundle ID

\`${appId}\`

## Build with Capacitor

\`\`\`bash
cd mobile-store
npm install
npm run cap:init
npm run cap:add:ios
npm run cap:sync
npm run cap:open:ios
\`\`\`

In Xcode: select team → Product → Archive → Distribute App → App Store Connect.

## Review tips

- Describe that the app is a **business web application** in a native shell.
- Provide a demo account if login is required.
- Ensure login/signup works over HTTPS on real devices.
`;

  const mobilePackageJson = {
    name: `${pkgName}-mobile-store`,
    private: true,
    version: "1.0.0",
    description: `Mobile store packaging for ${title}`,
    scripts: {
      "cap:init": "npx cap init",
      "cap:add:android": "npx cap add android",
      "cap:add:ios": "npx cap add ios",
      "cap:sync": "npx cap sync",
      "cap:open:android": "npx cap open android",
      "cap:open:ios": "npx cap open ios",
      "android:twa:init":
        "npx @bubblewrap/cli init --manifest=https://YOUR_PRODUCTION_URL.example.com/manifest.webmanifest",
      "android:twa:build": "npx @bubblewrap/cli build",
    },
    devDependencies: {
      "@capacitor/android": "^7.0.0",
      "@capacitor/cli": "^7.0.0",
      "@capacitor/core": "^7.0.0",
      "@capacitor/ios": "^7.0.0",
      "@bubblewrap/cli": "^1.22.0",
    },
  };

  const capacitorConfig = `import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: ${JSON.stringify(appId)},
  appName: ${JSON.stringify(title)},
  webDir: "../out",
  server: {
    url: ${JSON.stringify(productionUrl)},
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: "automatic",
  },
};

export default config;
`;

  const twaManifest = {
    packageId: appId,
    host: new URL(productionUrl.startsWith("http") ? productionUrl : `https://${productionUrl}`)
      .host,
    name: title,
    launcherName: title.slice(0, 12),
    display: "standalone",
    themeColor,
    navigationColor: themeColor,
    backgroundColor: "#ffffff",
    startUrl: "/",
    iconUrl: `${productionUrl.replace(/\/$/, "")}/icons/icon.svg`,
    maskableIconUrl: `${productionUrl.replace(/\/$/, "")}/icons/maskable-icon.svg`,
    splashScreenFadeOutDuration: 300,
    enableNotifications: false,
    shortcuts: [],
    generatorApp: "Trend Business AI App Builder",
  };

  const assetLinks = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: appId,
        sha256_cert_fingerprints: ["REPLACE_WITH_YOUR_SIGNING_CERT_SHA256"],
      },
    },
  ];

  const pwaRegister = `"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      /* optional — offline not required for store shell */
    });
  }, []);
  return null;
}
`;

  const serviceWorker = `self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  /* Network-first — app requires live API routes */
});
`;

  return [
    {
      path: "public/manifest.webmanifest",
      language: "json",
      content: `${JSON.stringify(manifest, null, 2)}\n`,
    },
    {
      path: "public/icons/icon.svg",
      language: "svg",
      content: iconSvg,
    },
    {
      path: "public/icons/maskable-icon.svg",
      language: "svg",
      content: maskableSvg,
    },
    {
      path: "public/sw.js",
      language: "javascript",
      content: serviceWorker,
    },
    {
      path: "public/.well-known/assetlinks.json",
      language: "json",
      content: `${JSON.stringify(assetLinks, null, 2)}\n`,
    },
    {
      path: "app/pwa-register.tsx",
      language: "tsx",
      content: pwaRegister,
    },
    {
      path: "mobile-store/README.md",
      language: "markdown",
      content: storeReadme,
    },
    {
      path: "mobile-store/GOOGLE_PLAY.md",
      language: "markdown",
      content: googlePlayMd,
    },
    {
      path: "mobile-store/APPLE_APP_STORE.md",
      language: "markdown",
      content: appleMd,
    },
    {
      path: "mobile-store/package.json",
      language: "json",
      content: `${JSON.stringify(mobilePackageJson, null, 2)}\n`,
    },
    {
      path: "mobile-store/capacitor.config.ts",
      language: "typescript",
      content: capacitorConfig,
    },
    {
      path: "mobile-store/twa-manifest.json",
      language: "json",
      content: `${JSON.stringify(twaManifest, null, 2)}\n`,
    },
  ];
}

/** Merge mobile-store paths into WEBAPP_SCAFFOLD_PATHS coverage. */
export const WEBAPP_MOBILE_STORE_PATHS = buildWebAppMobileStoreFiles({
  title: "Sample",
  pkgName: "sample-app",
}).map((file) => file.path);

export function mergeMobileStoreIntoProjectFiles(
  files: GeneratedProjectFile[],
  options: { title: string; productionUrl?: string; primaryColor?: string },
): GeneratedProjectFile[] {
  const paths = new Set(files.map((file) => file.path.replaceAll("\\", "/")));
  const pkgName =
    options.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "generated-app";
  const mobile = buildWebAppMobileStoreFiles({
    title: options.title,
    pkgName,
    productionUrl: options.productionUrl,
    primaryColor: options.primaryColor,
  });
  const merged = [...files];
  for (const file of mobile) {
    if (!paths.has(file.path.replaceAll("\\", "/"))) {
      merged.push(file);
    }
  }
  return merged;
}
