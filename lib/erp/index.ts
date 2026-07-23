export { runErpAssistant } from "./engine";
export { listCompanies, createCompany, ensureDefaultCompany } from "./companies";
export { listBranches, createBranch } from "./branches";
export {
  listAccounts,
  createAccount,
  ensureDefaultChartOfAccounts,
  listJournalEntries,
  createJournalEntry,
  createTransaction,
} from "./accounting";
export { listInvoices, createInvoice, updateInvoice } from "./invoices";
export { listExpenses, createExpense } from "./expenses";
export { listPayments, createPayment } from "./payments";
export { listProducts, createProduct, listCategories, createCategory } from "./products";
export { listWarehouses, createWarehouse } from "./warehouses";
export { listSuppliers, createSupplier } from "./suppliers";
export { listStockMovements, recordStockMovement, getStockLevels, computeInventoryValueCents } from "./inventory";
export {
  listSalesOrders,
  createSalesOrder,
  convertDealToSalesOrder,
  createInvoiceFromSalesOrder,
} from "./sales-orders";
export {
  listPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder,
  listApprovals,
  createApproval,
  updateApprovalStatus,
} from "./procurement";
export {
  listEmployees,
  createEmployee,
  listAttendance,
  recordAttendance,
  listPayroll,
  createPayrollRecord,
} from "./hr";
export { getErpAnalytics, computeErpAnalytics } from "./analytics";
export type { ErpAnalyticsSummary } from "./analytics";
export { buildErpHealthReport } from "./health";
export type { ErpHealthReport } from "./health";
export { hasErpPermission, ERP_ROLE_PERMISSIONS } from "./permissions";
export { logErpAudit } from "./audit";
export * from "./integrations";
import "@/lib/ai-core/adapters/erp-ai";
