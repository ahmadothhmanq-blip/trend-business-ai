"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ErpApproval, ErpPurchaseOrder, ErpSalesOrder } from "@/types/erp";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

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
  const wt = useWorkspaceT("erp");
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
    if (!res.ok) return toast.error(data.error ?? wt("toasts.failed"));
    setSalesOrders([data.order, ...salesOrders]);
    toast.success(wt("toasts.salesOrderCreated"));
  };

  const convertDeal = async () => {
    const res = await fetch("/api/erp/sales-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "convert-deal", companyId, dealId }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? wt("toasts.failed"));
    setSalesOrders([data.order, ...salesOrders]);
    toast.success(wt("toasts.dealConverted"));
  };

  const createPO = async () => {
    const res = await fetch("/api/erp/purchase-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, supplierId: supplierId || undefined, totalCents: Number(poTotal) * 100 }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? wt("toasts.failed"));
    setPurchaseOrders([data.purchaseOrder, ...purchaseOrders]);
    toast.success(wt("toasts.purchaseOrderCreated"));
  };

  const approve = async (id: string) => {
    const res = await fetch("/api/erp/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "review", id, status: "approved", reviewedBy: "admin" }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? wt("toasts.failed"));
    setApprovals(approvals.map((a) => (a.id === id ? data.approval : a)));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
          <p className="text-xs uppercase text-white/40">{wt("panels.operations.salesOrders")}</p>
          <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={wt("forms.customer")} className="border-white/10 bg-white/5 text-white" />
          <Input value={orderTotal} onChange={(e) => setOrderTotal(e.target.value)} placeholder={wt("forms.totalUsd")} className="border-white/10 bg-white/5 text-white" />
          <Button onClick={() => void createSO()}>{wt("panels.operations.createSo")}</Button>
          <Input value={dealId} onChange={(e) => setDealId(e.target.value)} placeholder={wt("forms.dealIdConvert")} className="border-white/10 bg-white/5 text-white" />
          <Button variant="outline" onClick={() => void convertDeal()}>{wt("panels.operations.convertCrmDeal")}</Button>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
          <p className="text-xs uppercase text-white/40">{wt("panels.operations.purchaseOrders")}</p>
          <Input value={supplierId} onChange={(e) => setSupplierId(e.target.value)} placeholder={wt("forms.supplierId")} className="border-white/10 bg-white/5 text-white" />
          <Input value={poTotal} onChange={(e) => setPoTotal(e.target.value)} placeholder={wt("forms.totalUsd")} className="border-white/10 bg-white/5 text-white" />
          <Button onClick={() => void createPO()}>{wt("panels.operations.createPo")}</Button>
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
              <Button size="sm" onClick={() => void approve(a.id)}>{wt("panels.operations.approve")}</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
