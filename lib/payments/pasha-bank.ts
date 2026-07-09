/**
 * PASHA Bank payment integration stub.
 * Checkout flow creates orders with AWAITING_PAYMENT status.
 * This module will initiate payment sessions without changing checkout UI.
 */

export type PaymentSession = {
  sessionId: string | null;
  redirectUrl: string | null;
  provider: "pasha_bank";
};

export async function createPashaBankSession(
  orderId: string,
  orderNumber: string,
  amount: number,
  currency: string
): Promise<PaymentSession> {
  // Future: call PASHA Bank API to create payment session
  void orderId;
  void orderNumber;
  void amount;
  void currency;

  return {
    sessionId: null,
    redirectUrl: null,
    provider: "pasha_bank",
  };
}

export async function handlePashaBankWebhook(payload: unknown) {
  void payload;
  // Future: verify webhook signature and update order/payment status
  return { received: true };
}
