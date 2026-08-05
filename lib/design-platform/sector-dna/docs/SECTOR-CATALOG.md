# Sector DNA Catalog

Official industry design intelligence profiles for TBDP Phase 4.

| ID | Name | Experience Profiles | Spacing | Surface |
|----|------|---------------------|---------|---------|
| `saas` | SaaS | technical, corporate, executive | balanced | layered |
| `restaurant` | Restaurant | hospitality, luxury, editorial | generous | immersive |
| `real-estate` | Real Estate | luxury, executive, corporate | generous | elevated |
| `medical` | Medical | healthcare, corporate, minimal | generous | flat |
| `creative-studio` | Creative Studio | creative, editorial, playful | editorial | immersive |
| `hotel-resort` | Hotel & Resort | hospitality, luxury, minimal | generous | immersive |
| `law-firm` | Law Firm | executive, corporate, luxury | balanced | layered |
| `finance` | Finance | executive, corporate, technical | balanced | layered |
| `education` | Education | playful, corporate, editorial | balanced | elevated |
| `logistics` | Logistics | technical, corporate, executive | compact | flat |

## Usage

```ts
import { getSectorDna, TBDP_SECTOR_CATALOG } from "@/lib/design-platform/sector-dna";

const saas = getSectorDna("saas");
console.log(TBDP_SECTOR_CATALOG);
```
