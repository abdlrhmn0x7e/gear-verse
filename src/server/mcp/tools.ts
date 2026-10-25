import type { ToolAnnotations } from "@modelcontextprotocol/server";
import type { JSONContent } from "@tiptap/react";
import z from "zod";
import {
  createProductInputSchema,
  updateProductInputSchema,
} from "@schemas/entities";
import { updateManyInventoryItemsInputSchema } from "~/lib/schemas/entities/inventory-item";
import { productsGetPageInputSchema } from "~/lib/schemas/contracts/admin/products";
import { brandsGetPageInputSchema } from "~/lib/schemas/contracts/admin/brands";
import { mediaGetPageInputSchema } from "~/lib/schemas/contracts/admin/media";
import { inventoryItemsGetPageInputSchema } from "~/lib/schemas/contracts/admin/inventory-items";
import { _admin } from "~/server/application/admin";

/** A tool the store's MCP server offers to an admin's ChatGPT or Claude. */
export interface McpTool {
  name: string;
  title: string;
  /** Written for the model: what the tool does and where the ids it takes come from. */
  description: string;
  input: z.ZodObject;
  annotations: ToolAnnotations;
  handler: (input: never) => Promise<unknown>;
}

/** Keeps a tool's handler typed by its input schema. */
function defineTool<Input extends z.ZodObject>(tool: {
  name: string;
  title: string;
  description: string;
  input: Input;
  annotations: ToolAnnotations;
  handler: (input: z.output<Input>) => Promise<unknown>;
}): McpTool {
  return tool;
}

const read = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} satisfies ToolAnnotations;

const write = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
} satisfies ToolAnnotations;

/** Descriptions are rich text (tiptap JSON), which has no JSON Schema, so models send plain text: blank lines split paragraphs. */
const descriptionText = z
  .string()
  .describe(
    "Plain text. Separate paragraphs with a blank line; no markdown or HTML.",
  );

function toDoc(text: string): JSONContent {
  return {
    type: "doc",
    content: text
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => ({
        type: "paragraph",
        content: [{ type: "text", text: paragraph }],
      })),
  };
}

/** An emptied Arabic description saves null, so the Arabic site shows the English one. */
function toArabicDoc(text: string | null | undefined) {
  return text?.trim() ? toDoc(text) : null;
}

const productId = z
  .number()
  .int()
  .positive()
  .describe("A product id, from search_products.");

const productFields = updateProductInputSchema
  .omit({ published: true })
  .extend({
    description: descriptionText.optional(),
    descriptionAr: descriptionText.nullish(),
  });

export const tools: McpTool[] = [
  defineTool({
    name: "search_products",
    title: "Search products",
    description:
      "Lists the store's products in store order with their id, title, slug, price, whether they're published, brand and category. The first page also returns the products pinned to the top of the home page under pinned. Filter by title, brand ids (list_brands) or category ids (list_categories). Pass the returned nextCursor as cursor to get the next page; it is null on the last page.",
    input: productsGetPageInputSchema,
    annotations: read,
    // like the admin's products page: the pinned ones aren't part of the paged list
    handler: async (input) => ({
      pinned: input.cursor
        ? []
        : await _admin.products.queries.getPinned(input.filters),
      ...(await _admin.products.queries.getPage(input)),
    }),
  }),

  defineTool({
    name: "get_product",
    title: "Get a product",
    description:
      "Gets one product with everything the admin edits: copy, prices, category and brand, media (the first is the thumbnail), SEO, options, variants and stock. inventory.id is the stock row of a product without variants, for set_stock; a product with variants keeps its stock per variant (use list_inventory for those rows).",
    input: z.object({ id: productId }),
    annotations: read,
    handler: ({ id }) => _admin.products.queries.findById(id),
  }),

  defineTool({
    name: "list_categories",
    title: "List categories",
    description:
      "Lists every category as a tree (each with its id, name and children), for a product's categoryId and the category filter of search_products.",
    input: z.object({}),
    annotations: read,
    handler: () => _admin.categories.queries.findAll(),
  }),

  defineTool({
    name: "list_brands",
    title: "List brands",
    description:
      "Lists the brands with their id and name, for a product's brandId and the brand filter of search_products. Pass the returned nextCursor as cursor to get the next page.",
    input: brandsGetPageInputSchema,
    annotations: read,
    handler: (input) => _admin.brands.queries.getPage(input),
  }),

  defineTool({
    name: "list_media",
    title: "List media",
    description:
      "Lists the images in the store's media library with their id, name and URL, newest first. A product's images must already be in the library (upload them in the admin); pass their ids as media[].mediaId, the first one being the thumbnail. Filter by file name; pass the returned nextCursor as cursor to get the next page.",
    input: mediaGetPageInputSchema,
    annotations: read,
    handler: (input) => _admin.media.queries.getPage(input),
  }),

  defineTool({
    name: "list_inventory",
    title: "List inventory",
    description:
      "Lists products with their stock rows: one row without a variant for a product without variants, or one row per variant, with the variant's option values. Each row's id is what set_stock takes. Filter by product title with inventorySearch; pass the returned nextCursor as cursor to get the next page.",
    input: inventoryItemsGetPageInputSchema,
    annotations: read,
    handler: (input) => _admin.inventoryItems.queries.getPage(input),
  }),

  defineTool({
    name: "create_product",
    title: "Create a draft product",
    description:
      "Creates a product as an unpublished draft; publish it with publish_product once the admin has checked it. Needs a categoryId (list_categories), a brandId (list_brands) and at least one media id from list_media. Prices are in EGP. Arabic copy (summaryAr, descriptionAr) is optional. For a product without variants set its stock with inventory.quantity. Returns the new product's id.",
    input: createProductInputSchema.omit({ published: true }).extend({
      description: descriptionText.min(1, "Description is required"),
      descriptionAr: descriptionText.nullish(),
    }),
    annotations: write,
    handler: ({ description, descriptionAr, ...product }) =>
      _admin.products.mutations.createDeep({
        ...product,
        published: false,
        description: toDoc(description),
        descriptionAr: toArabicDoc(descriptionAr),
      }),
  }),

  defineTool({
    name: "update_product",
    title: "Update a product",
    description:
      "Changes a product's fields; leave out what stays the same. media replaces every image (the first is the thumbnail). Variants and options are edited together, in the shape get_product returns them. Publishing and unpublishing go through publish_product, and stock alone through set_stock. Returns the product as saved.",
    input: z.object({ id: productId, data: productFields }),
    annotations: write,
    handler: async ({ id, data: { description, descriptionAr, ...data } }) => {
      await _admin.products.mutations.editDeep(id, {
        ...data,
        ...(description !== undefined && { description: toDoc(description) }),
        ...(descriptionAr !== undefined && {
          descriptionAr: toArabicDoc(descriptionAr),
        }),
      });
      return _admin.products.queries.findById(id);
    },
  }),

  defineTool({
    name: "set_stock",
    title: "Set stock",
    description:
      "Sets the quantity on hand of stock rows, by their id: get_product's inventory.id for a product without variants, or a variant's row id from list_inventory. The quantity replaces the current one; it isn't added to it.",
    input: updateManyInventoryItemsInputSchema,
    annotations: { ...write, idempotentHint: true },
    handler: (input) => _admin.inventoryItems.mutations.updateMany(input),
  }),

  defineTool({
    name: "publish_product",
    title: "Publish a product",
    description:
      "Publishes a product so customers can see and buy it on the storefront. Only call this when the admin has asked for the product to go live.",
    input: z.object({ id: productId }),
    annotations: { ...write, destructiveHint: true, idempotentHint: true },
    handler: async ({ id }) => {
      await _admin.products.mutations.editDeep(id, { published: true });
      return { id, published: true };
    },
  }),
];
