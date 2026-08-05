# AWQE Scoring System

## Dimensions

| Score | Range | Weight in Overall |
|-------|-------|-------------------|
| business | 0–100 | 1/7 |
| conversion | 0–100 | 1/7 |
| content | 0–100 | 1/7 |
| ux | 0–100 | 1/7 |
| accessibility | 0–100 | 1/7 |
| seo | 0–100 | 1/7 |
| performance | 0–100 | 1/7 |
| **overall** | 0–100 | average of 7 |

## Evaluation Signals

Each dimension produces:
- `score` — 0–100
- `signals` — strengths detected
- `issues` — weaknesses for recommendations

## Improvement Report

```ts
{
  strengths: string[];
  weaknesses: string[];
  recommendations: AwqeRecommendation[];
  appliedImprovements: string[];
}
```
