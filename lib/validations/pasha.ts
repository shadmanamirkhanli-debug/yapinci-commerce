import { z } from "zod";

export const pashaStartSchema = z.object({
  orderId: z.string().uuid(),
  // Guest checkout orders have no userId; ownership is proven via this token
  // instead (same convention as Order.guestToken elsewhere).
  guestToken: z.string().min(1).optional(),
});

export type PashaStartInput = z.infer<typeof pashaStartSchema>;
