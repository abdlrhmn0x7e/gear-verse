import z from "zod";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { addressGovernoratesEnum } from "~/lib/schemas/address";

const addressInputSchema = z.object({
  userId: z.number().int().positive(),
  address: z.string().min(1),
  city: z.string().min(1),
  governorate: addressGovernoratesEnum,
});

export const adminAddressesRouter = createTRPCRouter({
  create: adminProcedure
    .input(addressInputSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.admin.addresses.mutations.create(input);
    }),
});
