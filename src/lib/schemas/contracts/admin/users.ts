import z from "zod";
import { paginationSchema } from "../pagination";

export const usersGetPageInputSchema = paginationSchema.extend({
  filters: z
    .object({
      name: z.string().optional(),
    })
    .optional(),
});
export type UsersGetPageInput = z.infer<typeof usersGetPageInputSchema>;

/** better-auth's admin plugin roles: "user" is a customer. */
export const userRoles = ["user", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

/** Banned means a ban that hasn't expired yet. */
export const userStatuses = ["active", "banned"] as const;
export type UserStatus = (typeof userStatuses)[number];

export const usersGetManagePageInputSchema = paginationSchema.extend({
  filters: z
    .object({
      /** Matches the name or the email. */
      search: z.string().trim().max(200).optional(),
      role: z.enum(userRoles).optional(),
      status: z.enum(userStatuses).optional(),
    })
    .optional(),
});
export type UsersGetManagePageInput = z.infer<
  typeof usersGetManagePageInputSchema
>;

const userIdSchema = z.number().int().positive();

export const setUserRoleInputSchema = z.object({
  userId: userIdSchema,
  role: z.enum(userRoles),
});
export type SetUserRoleInput = z.infer<typeof setUserRoleInputSchema>;

/** How long a ban lasts, in seconds; `null` never lifts on its own. */
export const banDurations = {
  "1d": 60 * 60 * 24,
  "7d": 60 * 60 * 24 * 7,
  "30d": 60 * 60 * 24 * 30,
  permanent: null,
} as const;
export type BanDuration = keyof typeof banDurations;

export const banUserInputSchema = z.object({
  userId: userIdSchema,
  reason: z.string().trim().max(200, "Keep the reason under 200 characters"),
  duration: z.enum(
    Object.keys(banDurations) as [BanDuration, ...BanDuration[]],
  ),
});
export type BanUserInput = z.infer<typeof banUserInputSchema>;

export const userIdInputSchema = z.object({ userId: userIdSchema });
export type UserIdInput = z.infer<typeof userIdInputSchema>;
