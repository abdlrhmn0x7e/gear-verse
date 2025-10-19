import { sql, eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import {
  inventoryItems,
  media,
  productOptionValues,
  productOptionValuesVariants,
  productVariants,
} from "~/server/db/schema";

export const variantValuesCTE = db.$with("variant_values").as(
  db
    .select({
      id: productVariants.id,
      values: sql<string[]>`
						jsonb_agg(${productOptionValues.value})
					`.as("values"),
    })
    .from(productVariants)
    .leftJoin(
      productOptionValuesVariants,
      eq(productVariants.id, productOptionValuesVariants.productVariantId),
    )
    .leftJoin(
      productOptionValues,
      eq(
        productOptionValuesVariants.productOptionValueId,
        productOptionValues.id,
      ),
    )
    .groupBy(productVariants.id),
);

export const variantsCTE = db.$with("variants").as(
  db
    .with(variantValuesCTE)
    .select({
      productId: productVariants.productId,
      json: sql<
        {
          id: number;
          overridePrice: number | null;
          thumbnailUrl: string | null;
          stock: number;
          values: string[];
        }[]
      >`jsonb_agg(
          jsonb_build_object(
            'id', ${productVariants.id},
            'overridePrice', ${productVariants.overridePrice},
            'thumbnailUrl', ${media.url},
            'stock', ${inventoryItems.quantity},
            'values', ${variantValuesCTE.values}
          )
      )`.as("json"),
    })
    .from(productVariants)
    .leftJoin(variantValuesCTE, eq(productVariants.id, variantValuesCTE.id))
    .leftJoin(
      inventoryItems,
      and(
        eq(inventoryItems.productVariantId, productVariants.id),
        eq(inventoryItems.productId, productVariants.productId),
      ),
    )
    .leftJoin(media, eq(productVariants.thumbnailMediaId, media.id))
    .groupBy(productVariants.productId),
);
