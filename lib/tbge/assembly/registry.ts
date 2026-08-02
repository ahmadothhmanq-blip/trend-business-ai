/**
 * TBGE generator registry — plugin-based, product adapters may override.
 */

import { registerBuiltinGenerators } from "@/lib/tbge/assembly/generators";
import type { GeneratorPlugin, GeneratorRegistry } from "@/lib/tbge/assembly/generators/types";
import type { GeneratorId } from "@/lib/tbge/spec/types";

export function createGeneratorRegistry(
  plugins: GeneratorPlugin[] = [],
): GeneratorRegistry {
  const map = new Map<GeneratorId, GeneratorPlugin>();

  const registry: GeneratorRegistry = {
    register(plugin, options) {
      if (!options?.override && map.has(plugin.id)) return;
      map.set(plugin.id, plugin);
    },
    resolve(id) {
      return map.get(id);
    },
    has(id) {
      return map.has(id);
    },
    list() {
      return [...map.values()];
    },
  };

  registerBuiltinGenerators(registry);

  for (const plugin of plugins) {
    registry.register(plugin, { override: true });
  }

  return registry;
}
