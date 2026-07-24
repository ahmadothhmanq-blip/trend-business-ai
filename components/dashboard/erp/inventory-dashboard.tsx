"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ErpProduct, ErpSupplier, ErpWarehouse } from "@/types/erp";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

type Props = {
  companyId: string;
  initialProducts?: ErpProduct[];
  initialWarehouses?: ErpWarehouse[];
  initialSuppliers?: ErpSupplier[];
};

export function InventoryDashboard({
  companyId,
  initialProducts = [],
  initialWarehouses = [],
  initialSuppliers = [],
}: Props) {
  const wt = useWorkspaceT("erp");
  const [products, setProducts] = useState(initialProducts);
  const [warehouses, setWarehouses] = useState(initialWarehouses);
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [sku, setSku] = useState("");
  const [productName, setProductName] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [stockProductId, setStockProductId] = useState("");
  const [stockWarehouseId, setStockWarehouseId] = useState("");
  const [stockQty, setStockQty] = useState("1");

  const createProduct = async () => {
    if (!companyId) return toast.error(wt("panels.inventory.companyRequired"));
    const res = await fetch("/api/erp/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, sku, name: productName }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? wt("toasts.failed"));
    setProducts([data.product, ...products]);
    toast.success(wt("toasts.productCreated"));
  };

  const createWarehouse = async () => {
    const res = await fetch("/api/erp/warehouses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, name: warehouseName }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? wt("toasts.failed"));
    setWarehouses([data.warehouse, ...warehouses]);
    toast.success(wt("toasts.warehouseCreated"));
  };

  const createSupplier = async () => {
    const res = await fetch("/api/erp/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, name: supplierName }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? wt("toasts.failed"));
    setSuppliers([data.supplier, ...suppliers]);
    toast.success(wt("toasts.supplierCreated"));
  };

  const stockIn = async () => {
    const res = await fetch("/api/erp/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        productId: stockProductId,
        warehouseId: stockWarehouseId,
        movementType: "in",
        quantity: Number(stockQty),
      }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? wt("toasts.failed"));
    toast.success(wt("toasts.stockRecorded"));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
          <p className="text-xs uppercase text-white/40">{wt("panels.inventory.products")}</p>
          <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder={wt("forms.sku")} className="border-white/10 bg-white/5 text-white" />
          <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder={wt("forms.name")} className="border-white/10 bg-white/5 text-white" />
          <Button onClick={() => void createProduct()}>{wt("panels.inventory.addProduct")}</Button>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
          <p className="text-xs uppercase text-white/40">{wt("panels.inventory.warehouses")}</p>
          <Input value={warehouseName} onChange={(e) => setWarehouseName(e.target.value)} placeholder={wt("forms.warehouse")} className="border-white/10 bg-white/5 text-white" />
          <Button onClick={() => void createWarehouse()}>{wt("panels.inventory.addWarehouse")}</Button>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
          <p className="text-xs uppercase text-white/40">{wt("panels.inventory.suppliers")}</p>
          <Input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder={wt("forms.supplier")} className="border-white/10 bg-white/5 text-white" />
          <Button onClick={() => void createSupplier()}>{wt("panels.inventory.addSupplier")}</Button>
        </div>
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
        <p className="text-xs uppercase text-white/40">{wt("panels.inventory.stockIn")}</p>
        <div className="flex flex-wrap gap-2">
          <Input value={stockProductId} onChange={(e) => setStockProductId(e.target.value)} placeholder={wt("forms.productId")} className="border-white/10 bg-white/5 text-white" />
          <Input value={stockWarehouseId} onChange={(e) => setStockWarehouseId(e.target.value)} placeholder={wt("forms.warehouseId")} className="border-white/10 bg-white/5 text-white" />
          <Input value={stockQty} onChange={(e) => setStockQty(e.target.value)} placeholder={wt("forms.qty")} className="w-24 border-white/10 bg-white/5 text-white" />
          <Button onClick={() => void stockIn()}>{wt("panels.inventory.recordStockIn")}</Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3 text-sm text-white/60">
        <div>{wt("panels.inventory.productsCount", { count: products.length })}</div>
        <div>{wt("panels.inventory.warehousesCount", { count: warehouses.length })}</div>
        <div>{wt("panels.inventory.suppliersCount", { count: suppliers.length })}</div>
      </div>
    </div>
  );
}
