import z from "zod";

export const userEntitySchema = z.object({
  id: z.number("ID must be a number").positive("ID must be positive"),

  name: z.string("Name is required").min(1, "Name is too short"),
  email: z.email("Email is required"),
  image: z.url("Image is required").nullish(),

  role: z.enum(["user", "admin", "superadmin"]),

  banned: z.boolean("Banned is required"),
  banReason: z.string("Ban reason is required").nullish(),
  banExpiresAt: z.coerce.date<Date>("Ban expires at must be a date").nullish(),

  isAnonymous: z.boolean("Is anonymous is required"),

  createdAt: z.coerce.date<Date>("Created at must be a date"),
  updatedAt: z.coerce.date<Date>("Updated at must be a date"),
});
export type User = z.infer<typeof userEntitySchema>;

export const createUserInputSchema = userEntitySchema.omit({
  id: true,
  image: true,

  banned: true,
  banReason: true,
  banExpiresAt: true,

  createdAt: true,
  updatedAt: true,
});
export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const updateUserInputSchema = createUserInputSchema.partial();
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
