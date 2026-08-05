# Validation Flow

| Stage | Function | When |
|-------|----------|------|
| Before generation | `validateBeforeGeneration()` | After Master Plan build |
| Before LLM | `validateContentTasks()` | Before Content Provider call |
| After LLM | `validateStructuredContent()` | After Content Provider response |
| Before builder | `validateBeforeBuilder()` | Before TBGE assembly / legacy run |
| Before export | `validateBeforeExport()` | After project assembly |

All validation failures throw with stage context via `assertIntegrationValid()`.
