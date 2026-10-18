import { reverseGeocodeInputSchema } from "~/lib/schemas/contracts/public/geocoding";
import { tryCatch } from "~/lib/utils/try-catch";
import { createTRPCRouter, protectedProcedure } from "~/server/api/init";
import { errorMap } from "../../error-map";

export const userGeocodingRouter = createTRPCRouter({
  queries: {
    // goes through the server so Nominatim sees one identified client with one rate limit and a shared cache
    reverse: protectedProcedure
      .input(reverseGeocodeInputSchema)
      .query(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.public.geocoding.queries.reverse(input),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),
  },
});
