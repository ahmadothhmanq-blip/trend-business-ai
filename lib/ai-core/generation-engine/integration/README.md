# Master Plan + Website Builder Integration

Integrates TBGE2 Master Plan as the ONLY planning authority when `WB_MASTER_PLAN=1`.

## Target Flow

```
User Prompt → TBGE Analysis → Master Plan → Validation
  → Content Provider → Structured Content
  → Website Builder → TBDP → GLS → Generated Website
```

## Enable

```bash
WB_MASTER_PLAN=1
```

## Verification

```bash
npm run test:master-plan-integration
npm run verify:master-plan-integration
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Integration Flow](./docs/INTEGRATION-FLOW.md)
- [Validation](./docs/VALIDATION.md)
- [Backward Compatibility](./docs/BACKWARD-COMPATIBILITY.md)
