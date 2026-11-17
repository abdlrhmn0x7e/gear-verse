import type { ToolAnnotations } from "@modelcontextprotocol/server";
import type { JSONContent } from "@tiptap/react";
import { MarkdownManager } from "@tiptap/markdown";
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
import { AppError } from "~/lib/errors/app-error";
import { createBrandInputSchema } from "~/lib/schemas/entities/brand";
import { createCategoryInputSchema } from "~/lib/schemas/entities/category";
import { deleteCategoryInputSchema } from "~/lib/schemas/contracts/admin/categories";
import { contentExtensions } from "~/lib/editor/content-extensions";
import {
  createFullOrderInputSchema,
  updateFullOrderInputSchema,
} from "~/lib/schemas/entities/order";
import { createAddressInputSchema } from "~/lib/schemas/entities/address";
import { userEntitySchema } from "~/lib/schemas/entities/users";
import { usersGetPageInputSchema } from "~/lib/schemas/contracts/admin/users";
import { ordersGetPageInputSchema } from "~/lib/schemas/contracts/admin/orders";
import { _admin } from "~/server/application/admin";

export interface McpTool {
  name: string;
  title: string;
  description: string;
  input: z.ZodObject;
  annotations: ToolAnnotations;
  _meta?: Record<string, unknown>;
  run: (args: unknown) => Promise<unknown>;
}

/** Keeps a tool's handler typed by its input schema; the MCP server has already parsed args with it. */
function defineTool<Input extends z.ZodObject>({
  handler,
  ...tool
}: Omit<McpTool, "input" | "run"> & {
  input: Input;
  handler: (input: z.output<Input>) => Promise<unknown>;
}): McpTool {
  return { ...tool, run: (args) => handler(args as z.output<Input>) };
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

/**
 * Descriptions are rich text (tiptap JSON), which has no JSON Schema, so models write Markdown. It's parsed with the
 * editor's own extensions, so only what the editor can show survives; anything else (tables, code, HTML) is dropped or
 * kept as plain text.
 */
const markdown = new MarkdownManager({ extensions: contentExtensions });

const descriptionText = z
  .string()
  .describe(
    "Markdown: ## and ### headings, **bold**, *italic*, ~~strikethrough~~, [links](https://...), - bulleted and 1. numbered lists, and images on their own line as ![what it shows](url), using a url from upload_images so the image stays in the store's storage. Tables, code, quotes and HTML aren't supported.",
  );

const isUrl = (value: unknown, protocols: string[]) =>
  typeof value === "string" &&
  URL.canParse(value) &&
  protocols.includes(new URL(value).protocol);

/** Images load on the storefront and links open from it, so only web links are kept. */
function assertWebLinks({ type, attrs, marks, content }: JSONContent) {
  if (type === "image" && !isUrl(attrs?.src, ["https:"])) {
    throw new AppError(
      `Images need an https link, not ${String(attrs?.src)}`,
      "BAD_REQUEST",
    );
  }
  for (const mark of marks ?? []) {
    if (mark.type === "link" && !isUrl(mark.attrs?.href, ["https:", "http:"])) {
      throw new AppError(
        `Links need a web address, not ${String(mark.attrs?.href)}`,
        "BAD_REQUEST",
      );
    }
  }
  content?.forEach(assertWebLinks);
}

function toDoc(text: string): JSONContent {
  const doc = markdown.parse(text);
  assertWebLinks(doc);
  return doc;
}

/** An emptied Arabic description saves null, so the Arabic site shows the English one. */
function toArabicDoc(text: string | null | undefined) {
  return text?.trim() ? toDoc(text) : null;
}

/** The model reads descriptions in the Markdown it writes them in. */
function withMarkdown<
  Product extends {
    description: JSONContent;
    descriptionAr: JSONContent | null;
  },
>(product: Product) {
  return {
    ...product,
    description: markdown.serialize(product.description),
    descriptionAr: product.descriptionAr
      ? markdown.serialize(product.descriptionAr)
      : null,
  };
}

const productId = z
  .number()
  .int()
  .positive()
  .describe("A product id, from search_products.");

const orderId = z
  .number()
  .int()
  .positive()
  .describe("An order id, from list_orders.");

const userId = z
  .number()
  .int()
  .positive()
  .describe("A customer id, from search_customers or create_customer.");

const orderItemsText =
  "The order's lines: productId from search_products and, for a product with variants, productVariantId from get_product's variants (null otherwise), with a quantity of 1 or more. Prices are taken from the products.";

const orderFields = createFullOrderInputSchema.extend({
  userId,
  addressId: z
    .number()
    .int()
    .positive()
    .describe("One of this customer's address ids, from list_addresses."),
  paymentMethod: createFullOrderInputSchema.shape.paymentMethod.default("COD"),
  status: createFullOrderInputSchema.shape.status.default("PENDING"),
  items: createFullOrderInputSchema.shape.items.describe(orderItemsText),
});

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
    handler: ({ id }) =>
      _admin.products.queries.findById(id).then(withMarkdown),
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
      "Lists the images in the store's media library with their id, name and URL, newest first. A product's images must be in the library (add new ones with upload_images); pass their ids as media[].mediaId, the first one being the thumbnail. Filter by file name; pass the returned nextCursor as cursor to get the next page.",
    input: mediaGetPageInputSchema,
    annotations: read,
    handler: (input) => _admin.media.queries.getPage(input),
  }),

  defineTool({
    name: "upload_images",
    title: "Upload images",
    description:
      "Adds images to the store's media library and returns their media ids, for media[].mediaId in create_product and update_product (the first is the thumbnail). Pass images the admin attached in this chat as files when the app offers them; otherwise pass public https links to the images as urls, such as the manufacturer's product photos. PNG, JPEG or WebP, up to 10 MB each and 10 per call.",
    input: z.object({
      files: z
        .array(
          z.object({
            download_url: z.string(),
            file_id: z.string(),
            mime_type: z.string().optional(),
            file_name: z.string().optional(),
          }),
        )
        .optional()
        .describe("Images the admin attached in the chat."),
      urls: z
        .array(z.url({ protocol: /^https$/ }))
        .optional()
        .describe("Public https links to images."),
    }),
    // ChatGPT fills `files` with the attachments; other clients only see a plain array
    _meta: { "openai/fileParams": ["files"] },
    annotations: { ...write, openWorldHint: true },
    handler: ({ files = [], urls = [] }) => {
      if (files.length + urls.length === 0) {
        throw new AppError(
          "Pass at least one image in files or urls",
          "BAD_REQUEST",
        );
      }
      return _admin.media.mutations.importImages([
        ...files.map((file) => ({
          url: file.download_url,
          name: file.file_name,
        })),
        ...urls.map((url) => ({ url })),
      ]);
    },
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
      "Creates a product as an unpublished draft; publish it with publish_product once the admin has checked it. Needs a categoryId (list_categories), a brandId (list_brands) and at least one media id from list_media or upload_images. Prices are in EGP. Arabic copy (summaryAr, descriptionAr) is optional. For a product without variants set its stock with inventory.quantity. Returns the new product's id.",
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
      "Changes a product's fields; leave out what stays the same. media replaces every image (the first is the thumbnail). description replaces the whole description; get_product returns it in Markdown, and centering set in the admin isn't kept, so only rewrite it when the admin asks. Variants and options are edited together, in the shape get_product returns them. Publishing goes through publish_product and stock alone through set_stock; unpublishing is done in the admin. Returns the product as saved.",
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
      return _admin.products.queries.findById(id).then(withMarkdown);
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

  defineTool({
    name: "create_brand",
    title: "Create a brand",
    description:
      "Creates a brand for products to use as their brandId. Check list_brands first so it isn't a duplicate. Needs a logo: an image id from list_media or upload_images (logoMediaId). Returns the new brand's id.",
    input: createBrandInputSchema,
    annotations: write,
    handler: (input) => _admin.brands.mutations.create(input),
  }),

  defineTool({
    name: "delete_brand",
    title: "Delete a brand",
    description:
      "Deletes a brand, by its id from list_brands. It's refused while any product uses the brand; move those products to another brand with update_product first. Only call this when the admin has asked for the brand to be deleted.",
    input: z.object({
      id: z.number().int().positive().describe("A brand id, from list_brands."),
    }),
    annotations: { ...write, destructiveHint: true },
    handler: ({ id }) => _admin.brands.mutations.delete(id),
  }),

  defineTool({
    name: "create_category",
    title: "Create a category",
    description:
      "Creates a category for products to use as their categoryId. Check list_categories first so it isn't a duplicate. Set parent_id to a category id from list_categories to make it a sub-category; leave it out for a top-level one. icon picks the category's icon. The descriptions and Arabic name are optional. Returns the new category's id.",
    input: createCategoryInputSchema,
    annotations: write,
    handler: (input) => _admin.categories.mutations.create(input),
  }),

  defineTool({
    name: "delete_category",
    title: "Delete a category",
    description:
      "Deletes a category, by its id from list_categories, together with all its sub-categories. It fails while the category or any of its sub-categories still has products; move them to another category with update_product first. Only call this when the admin has asked for the category to be deleted.",
    input: deleteCategoryInputSchema,
    annotations: { ...write, destructiveHint: true },
    handler: (input) => _admin.categories.mutations.delete(input),
  }),
  defineTool({
    name: "search_customers",
    title: "Search customers",
    description:
      "Lists customers with their id, name and email, newest first, filtered by name. Pass the returned nextCursor as cursor to get the next page. To find a customer by phone, search list_orders by the phone number instead.",
    input: usersGetPageInputSchema,
    annotations: read,
    handler: (input) => _admin.users.queries.getPage(input),
  }),

  defineTool({
    name: "create_customer",
    title: "Create a customer",
    description:
      "Creates a customer to place orders for, such as someone who ordered by phone or chat. Check search_customers first so it isn't a duplicate. The email is optional; one is made up when it's left out. Then add their shipping address with create_address. Returns the new customer's id.",
    input: z.object({
      name: userEntitySchema.shape.name.describe("The customer's full name."),
      email: userEntitySchema.shape.email.optional(),
    }),
    annotations: write,
    // like the admin's Add Customer form: customers made by the admin get a placeholder email
    handler: ({ name, email }) =>
      _admin.users.mutations.create({
        name,
        email: email ?? `temp-user-${Date.now()}@gearverse.com`,
        role: "user",
        isAnonymous: false,
      }),
  }),

  defineTool({
    name: "list_addresses",
    title: "List a customer's addresses",
    description:
      "Lists a customer's saved shipping addresses with their id, recipient, phone and location. An order ships to one of these (addressId).",
    input: z.object({ userId }),
    annotations: read,
    handler: (input) => _admin.addresses.queries.findByUserId(input),
  }),

  defineTool({
    name: "create_address",
    title: "Add an address",
    description:
      "Saves a shipping address for a customer, for an order's addressId. phoneNumber is an Egyptian mobile number. floor, apartment, additionalDetails and the map pin (latitude with longitude) are optional. Returns the new address's id.",
    input: createAddressInputSchema.extend({ userId }),
    annotations: write,
    handler: (input) => _admin.addresses.mutations.create(input),
  }),

  defineTool({
    name: "list_orders",
    title: "List orders",
    description:
      "Lists orders, newest first, with their id, customer, phone, shipping address, status, payment method, tracking number, item count, total, date and WhatsApp confirmation message. search matches the phone, the recipient or customer name, or the order number; filter by status, paymentMethod or how recently they were placed. Pass the returned nextCursor as cursor to get the next page.",
    input: ordersGetPageInputSchema,
    annotations: read,
    handler: (input) => _admin.orders.queries.getPage(input),
  }),

  defineTool({
    name: "get_order",
    title: "Get an order",
    description:
      "Gets one order with its customer, shipping address, status, payment, tracking number, totals and items (productId, productVariantId, quantity, price and stock on hand).",
    input: z.object({ id: orderId }),
    annotations: read,
    handler: ({ id }) => _admin.orders.queries.findDetailsById(id),
  }),

  defineTool({
    name: "create_order",
    title: "Create an order",
    description:
      "Creates an order for a customer (search_customers or create_customer) shipping to one of their addresses (list_addresses or create_address), and takes the items out of stock. Payment defaults to cash on delivery and status to PENDING. Set createdAt to backdate an order taken earlier; left out, it's now. Returns the order as saved.",
    input: orderFields.extend({
      // a Date has no JSON Schema, so the model sends ISO text
      createdAt: z.iso
        .datetime({ offset: true })
        .optional()
        .describe(
          "When the order was placed, with its UTC offset, e.g. 2026-11-15T14:30:00+02:00 for Cairo time. Not in the future.",
        ),
    }),
    annotations: write,
    handler: async ({ createdAt, ...order }) => {
      const { id } = await _admin.orders.mutations.create({
        ...order,
        createdAt: createdAt ? new Date(createdAt) : undefined,
      });
      return _admin.orders.queries.findDetailsById(id);
    },
  }),

  defineTool({
    name: "update_order",
    title: "Update an order",
    description:
      "Changes an order's fields; leave out what stays the same. items replaces every line, so to add, remove or change one, send all the lines from get_order with the change. Lines already on the order keep their price; stock follows the change. Setting status to CANCELLED puts the items back in stock. Returns the order as saved.",
    input: z.object({
      id: orderId,
      data: updateFullOrderInputSchema.extend({
        userId: userId.optional(),
        addressId: orderFields.shape.addressId.optional(),
        items: orderFields.shape.items.optional(),
      }),
    }),
    annotations: write,
    handler: async ({ id, data }) => {
      await _admin.orders.mutations.update({ ...data, id });
      return _admin.orders.queries.findDetailsById(id);
    },
  }),

  defineTool({
    name: "delete_order",
    title: "Delete an order",
    description:
      "Deletes an order for good and puts its items back in stock. To keep a record, set its status to CANCELLED with update_order instead. Only call this when the admin has asked for the order to be deleted.",
    input: z.object({ id: orderId }),
    annotations: { ...write, destructiveHint: true },
    handler: ({ id }) => _admin.orders.mutations.delete(id),
  }),
];
