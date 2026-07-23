"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ErpApproval, ErpPurchaseOrder, ErpSalesOrder } from "@/types/erp";

type Props = {
  companyId: string;
  initialSalesOrders?: ErpSalesOrder[];
  initialPurchaseOrders?: ErpPurchaseOrder[];
  initialApprovals?: ErpApproval[];
};

export function OperationsDashboard({
  companyId,
  initialSalesOrders = [],
  initialPurchaseOrders = [],
  initialApprovals = [],
}: Props) {
  const [salesOrders, setSalesOrders] = useState(initialSalesOrders);
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [customerName, setCustomerName] = useState("");
  const [orderTotal, setOrderTotal] = useState("0");
  const [dealId, setDealId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [poTotal, setPoTotal] = useState("0");

  const createSO = async () => {
    const res = await fetch("/api/erp/sales-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, customerName, totalCents: Number(orderTotal) * 100 }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setSalesOrders([data.order, ...salesOrders]);
    toast.success("Sales order created");
  };

  const convertDeal = async () => {
    const res = await fetch("/api/erp/sales-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "convert-deal", companyId, dealId }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setSalesOrders([data.order, ...salesOrders]);
    toast.success("CRM deal converted to sales order");
  };

  const createPO = async () => {
    const res = await fetch("/api/erp/purchase-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, supplierId: supplierId || undefined, totalCents: Number(poTotal) * 100 }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setPurchaseOrders([data.purchaseOrder, ...purchaseOrders]);
    toast.success("Purchase order created");
  };

  const approve = async (id: string) => {
    const res = await fetch("/api/erp/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "review", id, status: "approved", reviewedBy: "admin" }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setApprovals(approvals.map((a) => (a.id === id ? data.approval : a)));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
          <p className="text-xs uppercase text-white/40">Sales orders</p>
          <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer" className="border-white/10 bg-white/5 text-white" />
          <Input value={orderTotal} onChange={(e) => setOrderTotal(e.target.value)} placeholder="Total USD" className="border-white/10 bg-white/5 text-white" />
          <Button onClick={() => void createSO()}>Create SO</Button>
          <Input value={dealId} onChange={(e) => setDealId(e.target.value)} placeholder="CRM Deal ID to convert" className="border-white/10 bg-white/5 text-white" />
          <Button variant="outline" onClick={() => void convertDeal()}>Convert CRM deal</Button>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
          <p className="text-xs uppercase text-white/40">Purchase orders</p>
          <Input value={supplierId} onChange={(e) => setSupplierId(e.target.value)} placeholder="Supplier ID" className="border-white/10 bg-white/5 text-white" />
          <Input value={poTotal} onChange={(e) => setPoTotal(e.target.value)} placeholder="Total USD" className="border-white/10 bg-white/5 text-white" />
          <Button onClick={() => void createPO()}>Create PO</Button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 text-sm">
        <div className="space-y-1">
          {salesOrders.map((o) => (
            <div key={o.id} className="text-white/70">{o.order_number} · {o.customer_name} · {o.status}</div>
          ))}
        </div>
        <div className="space-y-1">
          {purchaseOrders.map((o) => (
            <div key={o.id} className="text-white/70">{o.po_number} · {o.status}</div>
          ))}
          {approvals.filter((a) => a.status === "pending").map((a) => (
            <div key={a.id} className="flex items-center justify-between text-white/70">
              <span>{a.title}</span>
              <Button size="sm" onClick={() => void approve(a.id)}>Approve</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
