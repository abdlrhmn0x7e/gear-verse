import { paginate } from "../helpers/pagination";
import { data } from "~/server/data-access";
import type { MediaGetPageInput } from "~/lib/schemas/contracts/admin/media";
import {
  createMediaInputSchema,
  type CreateMediaInput,
} from "~/lib/schemas/entities";
import z from "zod";
import { allowedMimeTypesEnum } from "~/lib/schemas/contracts/admin/allowed-mime-types";
import { AppError } from "~/lib/errors/app-error";

export const _media = {
  queries: {
    getPage: async (input: MediaGetPageInput) => {
      return paginate({ input, getPage: data.admin.media.queries.getPage });
    },
  },

  mutations: {
    createMany: async (input: CreateMediaInput[]) => {
      const validationSchema = z.array(
        createMediaInputSchema.and(
          z.object({
            mimeType: allowedMimeTypesEnum,
          }),
        ),
      );

      const parsedInput = validationSchema.safeParse(input);
      if (parsedInput.error) {
        throw new AppError("Invalid mime type", "VALIDATION");
      }

      return data.admin.media.mutations.createMany(parsedInput.data);
    },
  },
};
