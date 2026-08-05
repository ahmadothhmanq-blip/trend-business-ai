# Integration Diagram

```mermaid
flowchart TB
  subgraph Builder["Website Builder"]
    Gen["Generation Input"]
    Apply["Template Apply"]
    Preview["Preview"]
  end

  subgraph Engine["Template Engine"]
    V1["V1 Packages"]
    V2["V2 Packages"]
  end

  subgraph Integration["TBDP Integration Layer"]
    DR["Design Resolver"]
    TR["Template Resolver"]
    LB["Language Bridge"]
    TH["Theme Resolver"]
    BB["Builder Bridge"]
    AB["AI Bridge"]
    TB["Template Bridge"]
    LC["Lifecycle"]
  end

  subgraph TBDP["TBDP Phases 1–4"]
    F["Foundations"]
    C["Components"]
    E["Experience"]
    S["Sector DNA"]
  end

  Gen --> BB
  BB --> DR
  AB --> DR
  Apply --> TB
  TB --> TR
  TR --> DR

  DR --> S
  DR --> F
  DR --> C
  DR --> E
  LB --> DR
  TH --> DR

  TB -.->|advisory CSS| V1
  TB -.->|advisory CSS| V2
  BB -.->|enrichment metadata| Gen
  AB -.->|component selection| Gen

  LC --> BB
  LC --> TB
```

## Data Flow

1. **Builder** calls `enrichBuilderInput()` — receives additive metadata
2. **AI** calls `resolveAiWebsiteDesign()` — sector DNA drives all selections
3. **Template apply** calls `resolveTemplateBridge()` — advisory TBDP CSS layer
4. **Design Context** is the single resolved object across all bridges
