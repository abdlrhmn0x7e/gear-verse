import z from "zod";

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  pageSize: z.number(),
});
export type Pagination = z.infer<typeof paginationSchema>;
