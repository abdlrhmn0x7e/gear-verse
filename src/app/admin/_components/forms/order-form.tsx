"use client";

import { z } from "zod";

const updateOrderSchema = z.object({
  status: z.enum(["PENDING", "SHIPPED", "DELIVERED", "REFUNDED", "CANCELLED"]),
  address: z.object({
    city: z.string(),
    governorate: z.string(),
    address: z.string(),
  }),
  items: z.array(
    z.object({
      productVariantId: z.number(),
      quantity: z.number(),
    }),
  ),
});

export function UpdateOrderForm() {
  return <div>OrderForm</div>;
}
