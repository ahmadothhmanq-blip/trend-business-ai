/**
 * Re-export ERP bridge for Business Manager integration panel.
 * Reads real erp_invoices (not platform billing).
 */
export { getErpBridgeSummary } from "@/lib/erp/integrations/legacy-bridge";
export type { ErpBridgeSummary } from "@/lib/erp/integrations/legacy-bridge";
