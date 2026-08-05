# Website Builder — End-to-End Performance Report
**Run ID:** wb-mseww5e0
**Profile:** professional
**Total wall time:** 47089ms (47.1s)
**Server time:** 47089ms
**LLM calls:** 0
**Supabase ops:** 5
**SSE events:** 25
## Stage Timeline
| Stage | Start (ms) | End (ms) | Duration (ms) | % | Source |
|-------|-----------|---------|---------------|---|--------|
| Browser request | 0 | 0 | 0 | 0% | server |
| API route (auth, validation, stream open) | 0 | 1410 | 1410 | 3% | server |
| Stream initialization + session | 1410 | 2122 | 712 | 1.5% | server |
| AI Core (layerRunner total) | 2122 | 47640 | 45518 | 96.7% | server |
| Supabase writes (persist + checkpoints) | 47640 | 50733 | 3093 | 6.6% | server |
| Streaming updates (SSE) | 50733 | 97106 | 46373 | 98.5% | server |

## Stage | Duration | % of Total | Recommendation

| Streaming updates (SSE) | 46373ms | 98.5% | Throttle client preview bumps (already 4s in UI) |
| AI Core (layerRunner total) | 45518ms | 96.7% | Monitor — no optimization applied in this profiling pass |
| Supabase writes (persist + checkpoints) | 3093ms | 6.6% | Reduce checkpoint frequency; batch writes |
| API route (auth, validation, stream open) | 1410ms | 3% | Auth + rate limit + parent context load — cache user settings |
| Stream initialization + session | 712ms | 1.5% | Monitor — no optimization applied in this profiling pass |

## Every Database Operation

- **persistWebsiteGeneration**: 851ms
- **beginWebsiteGenerationSession**: 711ms
- **checkpointWebsiteGeneration**: 569ms
- **checkpointWebsiteGeneration**: 520ms
- **checkpointWebsiteGeneration**: 442ms

## SSE Events (sample)

- `session` @ 716ms (185 bytes)
- `progress` @ 716ms (102 bytes)
- `progress` @ 718ms (93 bytes)
- `progress` @ 719ms (109 bytes)
- `progress` @ 720ms (107 bytes)
- `progress` @ 720ms (83 bytes)
- `progress` @ 721ms (92 bytes)
- `progress` @ 721ms (98 bytes)
- `progress` @ 45142ms (86 bytes)
- `progress` @ 45143ms (85 bytes)
- `progress` @ 45144ms (103 bytes)
- `progress` @ 45144ms (103 bytes)
- `progress` @ 45145ms (103 bytes)
- `progress` @ 45147ms (103 bytes)
- `progress` @ 45148ms (103 bytes)
- `progress` @ 45148ms (103 bytes)
- `progress` @ 45148ms (84 bytes)
- `progress` @ 45149ms (82 bytes)
- `progress` @ 45149ms (85 bytes)
- `progress` @ 45149ms (84 bytes)
- `progress` @ 45150ms (101 bytes)
- `progress` @ 45151ms (110 bytes)
- `progress` @ 46234ms (107 bytes)
- `progress` @ 46235ms (94 bytes)
- `progress` @ 46236ms (95 bytes)

## Anomalies

- Repeated operation: `supabase::checkpointWebsiteGeneration` ×3 (1531ms)
- Untracked server time: 43995ms (JSON parse, prompt build, network gaps)
- 24 SSE progress events — client re-renders on each message
## Client-Side Timings (Generate click → UI complete)

| Metric | Duration |
|--------|----------|
| Click → response headers (TTFB) | 2519ms |
| Click → SSE stream complete | 48887ms |
| UI apply simulation | 0ms |
| **Click → UI complete** | **48887ms** |

**SSE events received:** 30
**Generation ID:** 83df03ea-d51b-4d3f-80b3-486e90c157a6
