"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { adminFieldClass } from "@/lib/admin/styles";

const ORDER_STATUSES = [
  "PENDING",
  "AWAITING_PAYMENT",
  "CONFIRMED",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  trackingNumber?: string | null;
  adminNotes?: string | null;
  customer: { name: string | null; email: string };
  items: {
    id: string;
    productName: string;
    quantity: number;
    total: number;
  }[];
  payment: {
    id: string;
    status: string;
    provider: string | null;
    amount: number;
  } | null;
};

export default function AdminOrderDetail({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [refundOpen, setRefundOpen] = useState(false);
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [refundAmount, setRefundAmount] = useState("");
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (cancelled) return;

      const result = await response.json();
      if (cancelled || !result.success) return;

      setOrder(result.data);
      setStatus(result.data.status);
      setTrackingNumber(result.data.trackingNumber ?? "");
      setAdminNotes(result.data.adminNotes ?? "");
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, trackingNumber, adminNotes }),
    });
    const result = await response.json();
    setSaving(false);
    if (result.success) {
      setOrder(result.data);
      setMessage("Order updated");
    } else {
      setMessage(result.error ?? "Update failed");
    }
  };

  const openRefund = () => {
    setRefundType("full");
    setRefundAmount(order ? String(order.payment?.amount ?? "") : "");
    setRefundError(null);
    setRefundOpen(true);
  };

  const submitRefund = async () => {
    if (!order) return;

    setRefundError(null);

    const body: { amount?: number } = {};
    if (refundType === "partial") {
      const parsedAmount = Number(refundAmount);
      if (!refundAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        setRefundError("Enter a valid refund amount");
        return;
      }
      if (order.payment && parsedAmount > order.payment.amount) {
        setRefundError("Refund amount cannot exceed the amount paid");
        return;
      }
      body.amount = parsedAmount;
    }

    setRefunding(true);
    const response = await fetch(`/api/admin/orders/${orderId}/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    setRefunding(false);

    if (result.success) {
      setOrder(result.data);
      setStatus(result.data.status);
      setRefundOpen(false);
      setMessage(refundType === "full" ? "Order fully refunded" : "Partial refund processed");
    } else {
      setRefundError(result.error ?? "Refund failed");
    }
  };

  if (!order) {
    return <p className="text-sm text-neutral-500">Loading order...</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title={order.orderNumber}
        description={`${order.customer.name ?? order.customer.email} · ${order.total} ${order.currency}`}
        actions={
          <Link
            href="/admin/orders"
            className="text-xs uppercase tracking-[0.15em] text-neutral-400 hover:text-white"
          >
            ← Back to orders
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 xl:col-span-2">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em]">
            Order Items
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between border-b border-neutral-800 py-3"
              >
                <span>
                  {item.productName} × {item.quantity}
                </span>
                <span>
                  {item.total} {order.currency}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
              Status Update
            </h2>
            <Select
              label="Status"
              options={ORDER_STATUSES.map((value) => ({
                value,
                label: value,
              }))}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={adminFieldClass}
            />
            <div className="mt-4">
              <Input
                label="Tracking Number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className={adminFieldClass}
              />
            </div>
            <div className="mt-4">
              <Textarea
                label="Order Notes"
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className={adminFieldClass}
              />
            </div>
            <Button
              type="button"
              className="mt-4 w-full"
              loading={saving}
              onClick={save}
            >
              Save Changes
            </Button>
            {message && (
              <p className="mt-3 text-sm text-neutral-400">{message}</p>
            )}
          </div>

          {order.payment?.status === "COMPLETED" && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
                Payment
              </h2>
              <p className="text-sm text-neutral-400">
                Paid {order.payment.amount} {order.currency}
                {order.payment.provider ? ` via ${order.payment.provider}` : ""}
              </p>
              <Button
                type="button"
                variant="danger"
                className="mt-4 w-full"
                onClick={openRefund}
              >
                Refund
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={refundOpen}
        onClose={() => (refunding ? undefined : setRefundOpen(false))}
        title="Refund payment"
        description={`Order ${order.orderNumber} · paid ${order.payment?.amount ?? 0} ${order.currency}`}
      >
        <div className="space-y-4">
          <Select
            label="Refund type"
            options={[
              { value: "full", label: "Full refund" },
              { value: "partial", label: "Partial refund" },
            ]}
            value={refundType}
            onChange={(e) => {
              const value = e.target.value as "full" | "partial";
              setRefundType(value);
              if (value === "full") {
                setRefundAmount(String(order.payment?.amount ?? ""));
              }
            }}
            className={adminFieldClass}
          />
          {refundType === "partial" && (
            <Input
              label={`Amount (${order.currency})`}
              type="number"
              min={0}
              max={order.payment?.amount}
              step="0.01"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className={adminFieldClass}
            />
          )}
          <p className="text-sm text-neutral-400">
            {refundType === "full"
              ? `This will fully refund ${order.payment?.amount} ${order.currency} and restock the order's inventory.`
              : `This will refund ${refundAmount || "0"} ${order.currency}. Inventory will not be restocked for a partial refund.`}
          </p>
          {refundError && (
            <p className="text-sm text-red-400" role="alert">
              {refundError}
            </p>
          )}
          <Button
            type="button"
            variant="danger"
            className="w-full"
            loading={refunding}
            onClick={submitRefund}
          >
            Confirm Refund
          </Button>
        </div>
      </Modal>
    </div>
  );
}
