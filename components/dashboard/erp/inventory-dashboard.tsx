"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ErpProduct, ErpSupplier, ErpWarehouse } from "@/types/erp";

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
    if (!companyId) return toast.error("Company required");
    const res = await fetch("/api/erp/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, sku, name: productName }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setProducts([data.product, ...products]);
    toast.success("Product created");
  };

  const createWarehouse = async () => {
    const res = await fetch("/api/erp/warehouses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, name: warehouseName }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setWarehouses([data.warehouse, ...warehouses]);
    toast.success("Warehouse created");
  };

  const createSupplier = async () => {
    const res = await fetch("/api/erp/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, name: supplierName }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setSuppliers([data.supplier, ...suppliers]);
    toast.success("Supplier created");
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
    if (!res.ok) return toast.error(data.error ?? "Failed");
    toast.success("Stock movement recorded");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
          <p className="text-xs uppercase text-white/40">Products</p>
          <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU" className="border-white/10 bg-white/5 text-white" />
          <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Name" className="border-white/10 bg-white/5 text-white" />
          <Button onClick={() => void createProduct()}>Add product</Button>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
          <p className="text-xs uppercase text-white/40">Warehouses</p>
          <Input value={warehouseName} onChange={(e) => setWarehouseName(e.target.value)} placeholder="Warehouse" className="border-white/10 bg-white/5 text-white" />
          <Button onClick={() => void createWarehouse()}>Add warehouse</Button>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
          <p className="text-xs uppercase text-white/40">Suppliers</p>
          <Input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Supplier" className="border-white/10 bg-white/5 text-white" />
          <Button onClick={() => void createSupplier()}>Add supplier</Button>
        </div>
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
        <p className="text-xs uppercase text-white/40">Stock in</p>
        <div className="flex flex-wrap gap-2">
          <Input value={stockProductId} onChange={(e) => setStockProductId(e.target.value)} placeholder="Product ID" className="border-white/10 bg-white/5 text-white" />
          <Input value={stockWarehouseId} onChange={(e) => setStockWarehouseId(e.target.value)} placeholder="Warehouse ID" className="border-white/10 bg-white/5 text-white" />
          <Input value={stockQty} onChange={(e) => setStockQty(e.target.value)} placeholder="Qty" className="w-24 border-white/10 bg-white/5 text-white" />
          <Button onClick={() => void stockIn()}>Record stock in</Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3 text-sm text-white/60">
        <div>{products.length} products</div>
        <div>{warehouses.length} warehouses</div>
        <div>{suppliers.length} suppliers</div>
      </div>
    </div>
  );
}
