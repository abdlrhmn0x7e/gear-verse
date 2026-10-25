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
import { s3IsPublicUrl, s3PutObject } from "~/lib/s3";
import cuid from "cuid";
import { downloadImage } from "../helpers/download-image";

/** How many images one import may fetch. */
const MAX_IMPORT_IMAGES = 10;

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
        throw new AppError("Invalid mime type", "BAD_REQUEST");
      }

      // media is only ever uploaded to the bucket, so a URL anywhere else
      // didn't come from an upload
      if (!parsedInput.data.every((media) => s3IsPublicUrl(media.url))) {
        throw new AppError(
          "Media has to be uploaded to the store's storage bucket",
          "BAD_REQUEST",
        );
      }

      return data.admin.media.mutations.createMany(parsedInput.data);
    },

    /** Adds images from links to the library, for chat clients that can't upload through the admin's browser. */
    importImages: async (sources: { url: string; name?: string }[]) => {
      if (sources.length === 0 || sources.length > MAX_IMPORT_IMAGES) {
        throw new AppError(
          `Import between 1 and ${MAX_IMPORT_IMAGES} images at a time`,
          "BAD_REQUEST",
        );
      }

      // every download is checked before anything is stored
      const images = await Promise.all(
        sources.map(async ({ url, name }) => ({
          ...(await downloadImage(url)),
          // a blank name falls back too
          name:
            [name, new URL(url).pathname.split("/").pop()].find(Boolean) ??
            "image",
        })),
      );

      const media = await Promise.all(
        images.map(async ({ bytes, mimeType, name }) => ({
          name,
          mimeType,
          url: await s3PutObject({ key: cuid(), body: bytes, mimeType }),
        })),
      );

      return _media.mutations.createMany(media);
    },
  },
};
