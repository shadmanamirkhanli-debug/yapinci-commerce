import { test } from "node:test";
import assert from "node:assert/strict";
import { PaymentStatus } from "@prisma/client";
import { isPaymentRefundable } from "../pasha-refund";

test("isPaymentRefundable: COMPLETED payments are refundable", () => {
  assert.equal(isPaymentRefundable(PaymentStatus.COMPLETED), true);
});

test("isPaymentRefundable: REFUNDED payments cannot be refunded again (double-refund guard)", () => {
  assert.equal(isPaymentRefundable(PaymentStatus.REFUNDED), false);
});

test("isPaymentRefundable: PENDING payments are not refundable", () => {
  assert.equal(isPaymentRefundable(PaymentStatus.PENDING), false);
});

test("isPaymentRefundable: FAILED payments are not refundable", () => {
  assert.equal(isPaymentRefundable(PaymentStatus.FAILED), false);
});
