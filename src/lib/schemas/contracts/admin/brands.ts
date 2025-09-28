import type z from "zod";
import { paginationSchema } from "../pagination";

export const brandsGetPageInputSchema = paginationSchema;
export type BrandsGetPageInput = z.infer<typeof brandsGetPageInputSchema>;
