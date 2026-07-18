# Final Launch Checklist

**Phase 11** — Complete every item before public announcement.  
Supersedes day-of use of `docs/LAUNCH_CHECKLIST.md` (keep that doc for detailed ops).

---

## 1. Code & verification

- [x] `npm run build` passes  
- [x] `npm run smoke:ai-core` passes  
- [x] `npm run smoke:core-products` passes (7 services)  
- [x] Phase 11 audit documented (`PHASE_11_FINAL_AUDIT.md`)  
- [x] Known issues published (`KNOWN_ISSUES.md`)  
- [x] Phase 12 staging tooling (`verify:staging`, `smoke:staging`, `STAGING_SETUP.md`)  
- [x] Phase 13 go-live tooling (`verify:golive`, `smoke:uat`, `FINAL_GO_LIVE_CHECKLIST.md`)  
- [ ] `npm run verify:staging -- --strict` on staging host (0 fail)  
- [ ] `STAGING_TEST_REPORT.md` manual UX signed off  
- [ ] `npm run verify:golive -- --production` on production (0 fail)  
- [ ] `FINAL_GO_LIVE_CHECKLIST.md` complete  
- [ ] `LAUNCH_BLOCKERS.md` CRITICAL cleared  
- [ ] `npm run verify:launch -- --production` on deploy host (0 fail)  

---

## 2. Environment & domain

- [ ] `NEXT_PUBLIC_SITE_URL=https://…`  
- [ ] Supabase URL + anon + **service role**  
- [ ] `DEEPSEEK_API_KEY` (or AI provider)  
- [ ] `BILLING_OPTIONAL` not `true`  
- [ ] `WEBSITE_PREVIEW_BUILDER_ENABLED=false`  
- [ ] Custom domain + HTTPS on Vercel  
- [ ] Upstash Redis (recommended)  

---

## 3. Auth UX (manual)

- [ ] Signup  
- [ ] Login / logout  
- [ ] Password reset  
- [ ] Profile save  
- [ ] Dashboard loads with credit balance  

---

## 4. Product UX (manual — each once)

| Product | Generate | View | Save/history | Export/publish |
|---------|----------|------|--------------|----------------|
| Website Builder | ☐ | ☐ | ☐ | ☐ ZIP + ☐ publish |
| App Builder | ☐ | ☐ | ☐ | ☐ ZIP |
| Landing Page Builder | ☐ | ☐ | ☐ | ☐ ZIP |
| Video Studio | ☐ | ☐ | ☐ | ☐ ZIP |
| Brand Designer | ☐ | ☐ | ☐ | ☐ ZIP |
| Content Studio | ☐ | ☐ | ☐ | ☐ ZIP |
| Marketing AI | ☐ | ☐ | ☐ | ☐ export |

---

## 5. Billing

- [ ] Free credits visible after signup  
- [ ] PayPal sandbox checkout (if monetizing)  
- [ ] Card (Visa) via PayPal hosted sandbox  
- [ ] Zero-credit returns **402**  
- [ ] Live PayPal only after sandbox pass  

---

## 6. Honesty & support

- [ ] Marketing copy matches `KNOWN_ISSUES.md` (video ≠ MP4; publish vs ZIP)  
- [ ] Support/contact path live  
- [ ] `/api/health` OK  

---

## Go / no-go

- [ ] No open CRITICAL code issues  
- [ ] Ops blockers resolved  
- [ ] `PRODUCTION_READINESS_REPORT.md` signed  

**Sign-off:** __________________  **Date:** __________
