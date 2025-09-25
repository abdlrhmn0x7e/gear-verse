import {
  createTRPCRouter,
  adminProcedure,
  protectedProcedure,
} from "../../trpc";
import { paginate } from "../../../application/helpers/pagination";
import { paginationSchema } from "~/lib/schemas/contracts/pagination";
import z from "zod";
import { TRPCError } from "@trpc/server";

const createOrderSchema = z.object({
  userId: z.number().int().positive(),
  phoneNumber: z.string().min(1),
  paymentMethod: z.enum(["COD"]),
  status: z.enum(["PENDING", "SHIPPED", "DELIVERED", "REFUNDED", "CANCELLED"]),
  addressId: z.number().int().positive(),
  items: z
    .array(
      z.object({
        productVariantId: z.number().int().positive(),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
});

export const adminOrdersRouter = createTRPCRouter({
  getPage: protectedProcedure
    .input(
      paginationSchema.extend({
        filters: z
          .object({
            orderId: z.number(),
            status: z.enum([
              "PENDING",
              "SHIPPED",
              "DELIVERED",
              "REFUNDED",
              "CANCELLED",
            ]),
            paymentMethod: z.enum(["COD"]),
          })
          .partial()
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return paginate({ input, getPage: ctx.db.admin.orders.getPage });
    }),

  findById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.admin.orders.findById({ id: input.id });
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      return order;
    }),

  create: adminProcedure
    .input(createOrderSchema)
    .mutation(async ({ ctx, input }) => {
      const { items, ...orderInput } = input;

      return ctx.db.admin.orders.create(orderInput, items);
    }),
});
