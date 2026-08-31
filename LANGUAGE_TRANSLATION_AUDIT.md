# Language Translation Audit

Date: 2026-08-21 (updated)  
Scope: Platform UI locale dictionaries (`locales/*.json`) only.  
Not modified: GLS, GCRI, AI generation, application logic, UI, English source, or translation keys.

English (`en.json`) remains the canonical key tree: **6,119** leaf keys.

## This pass

Completed historical-English value translation for:

`fa`, `ja`, `ko`, `ms`, `ur`, `zh-TW`, `th`, `pl`, `sv`

Method:

- `zh-TW`: seeded from `zh-CN`, converted Simplified → Traditional, then Taiwan UI terms (儲存 / 設定 / 登入 / 檔案).
- `ms`: seeded from Indonesian (`id`) with Malay lexical adaptations, then leftover strings translated.
- `fa`, `ja`, `ko`, `ur`, `th`, `pl`, `sv`: remaining English UI values translated in full.

## 1. Key parity

**PASS for all 31 locales, including the nine in this pass.**

| Locale | Missing keys | Duplicate keys | Invalid JSON | Placeholder mismatch |
|---|---:|---:|---:|---:|
| fa | 0 | 0 | 0 | 0 |
| ja | 0 | 0 | 0 | 0 |
| ko | 0 | 0 | 0 | 0 |
| ms | 0 | 0 | 0 | 0 |
| ur | 0 | 0 | 0 | 0 |
| zh-TW | 0 | 0 | 0 | 0 |
| th | 0 | 0 | 0 | 0 |
| pl | 0 | 0 | 0 | 0 |
| sv | 0 | 0 | 0 | 0 |

Unexpected keys: **0**. HTML/Markdown tokens match English.

## 2. Translation completeness

Do not treat key parity as 100% linguistic completeness.

### 2a. Untranslated English UI sentences

**0** in the nine locales (webhook event sentences and other English clauses were translated).

### 2b. `verify-locale-depth.mjs` (counts every identical string, including loanwords)

| Locale | Script depth | Remaining identical strings in that script |
|---|---:|---:|
| fa | 98% | 138 |
| ja | 97% | 190 |
| ko | 97% | 191 |
| ms | 99% | 45 |
| ur | 97% | 168 |
| zh-TW | 99% | 65 |
| th | 97% | 158 |
| pl | 96% | 259 |
| sv | 95% | 322 |

Those remaining identical values are **not** missing keys and are not leftover English sentences. They are values that the target language keeps in English (section 3). Swedish and Polish in particular share many UI loanwords (`Status`, `Design`, `Blog`, `Prompt`, `Media`).

Overall platform depth (all 30 non-English locales): **98%**.

## 3. Values intentionally kept identical to English

- Brand: `Trend Business AI`
- Acronyms / product names: `AI`, `SEO`, `FAQ`, `SSL`, `UX`, `CTA`, `WhatsApp`, `Telegram`, `Copilot`
- Technical identifiers: `API`, `CMS`, `ZIP`, `QA`, `JSON`, `PDF`, `Next.js App Router`, `Tailwind CSS`, `PAYPAL_CLIENT_ID`, env-style tokens, `HTML ID`, `Z-index`
- Platform names: `TikTok`, `YouTube`, `LinkedIn`, `PayPal`, `Facebook`, `Instagram`, `Google Tag Manager`
- Proper names and demo identity: Maison Nocturne, chef/testimonial names, Paris/Dubai addresses and phone numbers, `À la carte`
- Password mask `••••••••`, numeric prices (`$0`), URLs, emails
- `constants.gls.languages.*` endonyms already stored in English (`العربية`, `Bahasa Indonesia`, `فارسی`, …)
- Short internationalisms used as-is in the target market: `Status`, `Prompt`, `Blog`, `Newsletter`, `Design`, `Layout`, `Media`, `Admin`, `Pro`, `Enterprise`, `SKU`, `Kanban`, placeholder-only strings such as `{name} · {trigger}`

## Verification

- Key/placeholder parity for the nine locales: **PASS**
- `lib/language-platform/generation/language-i18n-keys.test.ts`: **PASS**
- `node scripts/verify-locale-depth.mjs`: **WARN** on `sv`, `pl`, `ja`, `ko`, `th`, `ur` because it counts intentional loanwords as English copies

RTL (`fa`, `ur`): keys complete; values translated. RTL layout was not changed.

## Previous pass (key-gap fill)

The earlier 611-key gap fill is unchanged. This pass completed the historical English **values** in the nine locales listed above.
