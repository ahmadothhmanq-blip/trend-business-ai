import { DEFAULT_INTEGRATIONS } from "../layout-dna.mjs";

/** @type {Record<string, (ctx: { p: string; pkg: string; Pascal: string }) => string>} */
export const INTEGRATIONS_GENERATORS = {
  "marquee-strip": marqueeStrip,
  "logo-grid": logoGrid,
  "category-columns": categoryColumns,
  "corporate-partners": corporatePartners,
  "minimal-logos": minimalLogos,
  "clinical-systems": clinicalSystems,
  "amenity-icons": amenityIcons,
  "supplier-list": supplierList,
  "academic-partners": academicPartners,
  "commerce-platforms": commercePlatforms,
  "pipeline-connectors": pipelineConnectors,
  "tool-strip": toolStrip,
  "property-systems": propertySystems,
  "organic-icons": organicIcons,
  "gradient-logos": gradientLogos,
  "terminal-modules": terminalModules,
  "api-terminal": apiTerminal,
  "spec-connectors": specConnectors,
  "firm-network": firmNetwork,
  "wellness-apps": wellnessApps,
};

export function generateIntegrations(entry, layoutKey) {
  const fn = INTEGRATIONS_GENERATORS[layoutKey] ?? marqueeStrip;
  return fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
}

function integrationsHeader({ p, pkg, Pascal }) {
  return `"use client";

const DEFAULT_LOGOS = ${JSON.stringify(DEFAULT_INTEGRATIONS, null, 2)};

type ${Pascal}IntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: Array<{ abbr: string; name: string; category: string }>;
};

export function ${Pascal}Integrations({
  eyebrow = "Integrations",
  title = "Connected to your stack",
  subtitle = "Native sync with the tools your team already uses.",
  logos = DEFAULT_LOGOS,
}: ${Pascal}IntegrationsProps) {`;
}

function marqueeStrip({ p, pkg, Pascal }) {
  return `${integrationsHeader({ p, pkg, Pascal })}
  const doubled = [...logos, ...logos];
  return (
    <section id="platform" data-v2-component="${pkg}-integrations" aria-labelledby="${p}-integrations-title" className="${p}-section-glow overflow-hidden border-y border-[var(--border-default)] py-14">
      <header className="mb-9 text-center">
        <p className="${p}-eyebrow">{eyebrow}</p>
        <h2 id="${p}-integrations-title" className="${p}-headline-sm mt-2">{title}</h2>
        <p className="${p}-body mx-auto mt-4 max-w-lg text-sm text-[var(--color-muted)]">{subtitle}</p>
      </header>
      <div className="flex gap-4 overflow-hidden">
        <div className="flex min-w-full shrink-0 animate-[scroll_30s_linear_infinite] gap-4 motion-reduce:animate-none">
          {doubled.map((logo, i) => (
            <div key={\`\${logo.abbr}-\${i}\`} className="${p}-card flex min-w-[10rem] flex-col items-center p-4">
              <span className="${p}-font-mono text-xs font-bold text-[var(--color-accent)]">{logo.abbr}</span>
              <span className="mt-2 text-xs text-[var(--color-muted)]">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function logoGrid({ p, pkg, Pascal }) {
  return `${integrationsHeader({ p, pkg, Pascal })}
  return (
    <section id="platform" data-v2-component="${pkg}-integrations" className="py-16">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm text-center">{title}</h2>
        <div className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-6">
          {logos.map((logo) => (
            <div key={logo.abbr} className="${p}-card flex aspect-square flex-col items-center justify-center p-3 text-center">
              <span className="font-bold">{logo.abbr}</span>
              <span className="mt-1 text-[0.65rem] text-[var(--color-muted)]">{logo.category}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function categoryColumns({ p, pkg, Pascal }) {
  return `${integrationsHeader({ p, pkg, Pascal })}
  const cols = [logos.slice(0, 2), logos.slice(2, 4), logos.slice(4)];
  return (
    <section id="platform" data-v2-component="${pkg}-integrations" className="${p}-section-alt py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {cols.map((group, i) => (
            <div key={i}>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Category {i + 1}</p>
              <ul className="mt-4 space-y-3">
                {group.map((logo) => (
                  <li key={logo.abbr} className="flex justify-between border-b border-[var(--border-subtle)] pb-2 text-sm">
                    <span>{logo.name}</span>
                    <span className="text-[var(--color-accent)]">{logo.abbr}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function corporatePartners({ p, pkg, Pascal }) {
  return logoGrid({ p, pkg, Pascal });
}

function minimalLogos({ p, pkg, Pascal }) {
  return `${integrationsHeader({ p, pkg, Pascal })}
  return (
    <section id="platform" data-v2-component="${pkg}-integrations" className="py-12">
      <div className="mx-auto flex max-w-[82rem] flex-wrap justify-center gap-12 px-5 opacity-50 sm:px-8">
        {logos.map((logo) => <span key={logo.abbr} className="text-sm font-semibold tracking-widest uppercase">{logo.abbr}</span>)}
      </div>
    </section>
  );
}
`;
}

function clinicalSystems({ p, pkg, Pascal }) {
  return categoryColumns({ p, pkg, Pascal });
}

function amenityIcons({ p, pkg, Pascal }) {
  return `${integrationsHeader({ p, pkg, Pascal })}
  return (
    <section id="platform" data-v2-component="${pkg}-integrations" className="py-12 text-center">
      <h2 className="${p}-headline-sm">{title}</h2>
      <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-6">
        {logos.map((logo) => (
          <span key={logo.abbr} className="rounded-full border border-[var(--border-accent)] px-5 py-2 text-sm">{logo.name}</span>
        ))}
      </div>
    </section>
  );
}
`;
}

function supplierList({ p, pkg, Pascal }) {
  return categoryColumns({ p, pkg, Pascal });
}

function academicPartners({ p, pkg, Pascal }) {
  return logoGrid({ p, pkg, Pascal });
}

function commercePlatforms({ p, pkg, Pascal }) {
  return minimalLogos({ p, pkg, Pascal });
}

function pipelineConnectors({ p, pkg, Pascal }) {
  return `${integrationsHeader({ p, pkg, Pascal })}
  return (
    <section id="platform" data-v2-component="${pkg}-integrations" className="py-16">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <ol className="mt-10 flex flex-col gap-0 lg:flex-row">
          {logos.map((logo, i) => (
            <li key={logo.abbr} className="flex flex-1 items-center border border-[var(--border-default)] p-4 lg:border-s-0 lg:first:rounded-s-lg lg:last:rounded-e-lg">
              <span className="${p}-font-mono text-[var(--color-accent)]">{String(i + 1).padStart(2, "0")}</span>
              <div className="ms-4">
                <p className="font-semibold">{logo.name}</p>
                <p className="text-xs text-[var(--color-muted)]">{logo.category}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
`;
}

function toolStrip({ p, pkg, Pascal }) {
  return minimalLogos({ p, pkg, Pascal });
}

function propertySystems({ p, pkg, Pascal }) {
  return categoryColumns({ p, pkg, Pascal });
}

function organicIcons({ p, pkg, Pascal }) {
  return amenityIcons({ p, pkg, Pascal });
}

function gradientLogos({ p, pkg, Pascal }) {
  return `${integrationsHeader({ p, pkg, Pascal })}
  return (
    <section id="platform" data-v2-component="${pkg}-integrations" className="relative overflow-hidden py-20 sm:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--color-accent),transparent_50%)] opacity-15" aria-hidden />
      <div className="relative mx-auto grid max-w-[82rem] gap-4 px-5 sm:grid-cols-3 sm:px-8">
        {logos.map((logo) => (
          <div key={logo.abbr} className="rounded-xl p-5" style={{ background: "linear-gradient(135deg, var(--color-accent), transparent)" }}>
            <p className="font-bold">{logo.name}</p>
            <p className="text-sm opacity-80">{logo.category}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
`;
}

function terminalModules({ p, pkg, Pascal }) {
  return `${integrationsHeader({ p, pkg, Pascal })}
  return (
    <section id="platform" data-v2-component="${pkg}-integrations" className="bg-[var(--color-background)] py-10 font-mono text-xs">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <p className="text-[var(--color-accent)]">$ modules --list</p>
        <pre className="mt-4">{logos.map((l) => \`\${l.abbr}  \${l.name.padEnd(24)} [\${l.category}]\`).join("\\n")}</pre>
      </div>
    </section>
  );
}
`;
}

function apiTerminal({ p, pkg, Pascal }) {
  return `${integrationsHeader({ p, pkg, Pascal })}
  return (
    <section id="platform" data-v2-component="${pkg}-integrations" className="bg-[#0a0f0a] py-10 font-mono text-sm text-[#00ff88]">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <p>GET /api/v1/integrations</p>
        <pre className="mt-4 text-[#00ff88]/80">{JSON.stringify(logos, null, 2)}</pre>
      </div>
    </section>
  );
}
`;
}

function specConnectors({ p, pkg, Pascal }) {
  return `${integrationsHeader({ p, pkg, Pascal })}
  return (
    <section id="platform" data-v2-component="${pkg}-integrations" className="py-12" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
      <table className="mx-auto w-full max-w-2xl border-collapse text-sm">
        <thead><tr className="border-b-2 border-[var(--color-accent)]"><th className="py-2 text-start">ID</th><th className="py-2 text-start">Module</th><th className="py-2 text-end">Type</th></tr></thead>
        <tbody>{logos.map((l) => <tr key={l.abbr} className="border-b border-[var(--border-subtle)]"><td className="py-2">{l.abbr}</td><td>{l.name}</td><td className="text-end">{l.category}</td></tr>)}</tbody>
      </table>
    </section>
  );
}
`;
}

function firmNetwork({ p, pkg, Pascal }) {
  return categoryColumns({ p, pkg, Pascal });
}

function wellnessApps({ p, pkg, Pascal }) {
  return amenityIcons({ p, pkg, Pascal });
}
