/**
 * Exercises the backorder stock math against the real database on throwaway
 * rows, deleted again at the end. Run from the repo root: `bun scripts/backorder-stock-check.ts`.
 */
import assert from "node:assert/strict";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "~/server/db";
import {
  addresses,
  brands,
  carts,
  categories,
  inventoryItems,
  media,
  orderItems,
  orders,
  products,
  users,
} from "~/server/db/schema";
import { _orders as adminOrders } from "~/server/data-access/admin/orders";
import { _orders as publicOrders } from "~/server/data-access/public/orders";

const tag = `backorder-check-${Date.now()}`;

const [anyMedia] = await db.select({ id: media.id }).from(media).limit(1);
const [anyCategory] = await db
  .select({ id: categories.id })
  .from(categories)
  .limit(1);
const [anyBrand] = await db.select({ id: brands.id }).from(brands).limit(1);
assert(
  anyMedia && anyCategory && anyBrand,
  "needs one media, category and brand row",
);

const [user] = await db
  .insert(users)
  .values({ name: tag, email: `${tag}@example.invalid` })
  .returning({ id: users.id });
assert(user);
const productIds: number[] = [];

const newProduct = async (
  slug: string,
  allowBackorder: boolean,
  stock: number,
) => {
  const [product] = await db
    .insert(products)
    .values({
      title: `${tag} ${slug}`,
      slug: `${tag}-${slug}`,
      price: 100,
      summary: tag,
      description: {},
      allowBackorder,
      thumbnailMediaId: anyMedia.id,
      categoryId: anyCategory.id,
      brandId: anyBrand.id,
    })
    .returning({ id: products.id });
  assert(product);
  productIds.push(product.id);
  await db
    .insert(inventoryItems)
    .values({ productId: product.id, quantity: stock });
  return product.id;
};

const stockOf = async (productId: number) =>
  db
    .select({ quantity: inventoryItems.quantity })
    .from(inventoryItems)
    .where(
      and(
        eq(inventoryItems.productId, productId),
        isNull(inventoryItems.productVariantId),
      ),
    )
    .then(([row]) => row?.quantity);

const lineOf = async (orderId: number) =>
  db
    .select({
      quantity: orderItems.quantity,
      backorderedQuantity: orderItems.backorderedQuantity,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .then(([row]) => row);

const place = async (
  productId: number,
  quantity: number,
  allowBackorder: boolean,
) => {
  const [cart] = await db
    .insert(carts)
    .values({ userId: user.id })
    .returning({ id: carts.id });
  assert(cart);
  try {
    return await publicOrders.mutations.create(
      {
        userId: user.id,
        paymentMethod: "COD",
        status: "PENDING",
        address: {
          fullName: tag,
          phoneNumber: "01000000000",
          address: tag,
          buildingNameOrNumber: "1",
          city: "Cairo",
          governorate: "CAIRO",
        },
      },
      [{ productId, productVariantId: null, quantity, allowBackorder }],
      cart.id,
    );
  } finally {
    await db.delete(carts).where(eq(carts.id, cart.id));
  }
};

try {
  const backorderId = await newProduct("backorder", true, 1);
  const order = await place(backorderId, 3, true);

  assert.equal(await stockOf(backorderId), 0, "placement takes the 1 in stock");
  assert.deepEqual(await lineOf(order.id), {
    quantity: 3,
    backorderedQuantity: 2,
  });
  console.log("ok  order 3 with stock 1 -> stock 0, backordered 2");

  await adminOrders.mutations.update(order.id, { status: "CANCELLED" });
  assert.equal(
    await stockOf(backorderId),
    1,
    "cancel returns only the held unit",
  );
  console.log("ok  cancel -> stock 1");

  await adminOrders.mutations.update(order.id, { status: "PENDING" });
  assert.equal(
    await stockOf(backorderId),
    0,
    "un-cancel takes the held unit again",
  );
  console.log("ok  un-cancel -> stock 0");

  await adminOrders.mutations.update(order.id, undefined, [
    { productId: backorderId, productVariantId: null, quantity: 2 },
  ]);
  assert.deepEqual(await lineOf(order.id), {
    quantity: 2,
    backorderedQuantity: 2,
  });
  assert.equal(
    await stockOf(backorderId),
    1,
    "the edit gives back the held unit",
  );
  console.log(
    "ok  edit 3 -> 2 keeps 2 backordered and returns the held unit -> stock 1",
  );

  await adminOrders.mutations.delete(order.id);
  assert.equal(
    await stockOf(backorderId),
    1,
    "deleting restocks no backordered units",
  );
  console.log("ok  delete -> stock 1");

  const normalId = await newProduct("normal", false, 0);
  await assert.rejects(
    place(normalId, 1, false),
    "a product without backorders can't oversell",
  );
  assert.equal(await stockOf(normalId), 0);
  console.log("ok  non-backorder product with stock 0 fails placement");
} finally {
  const userOrders = db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.userId, user.id));
  await db.delete(orderItems).where(inArray(orderItems.orderId, userOrders));
  await db.delete(orders).where(eq(orders.userId, user.id));
  if (productIds.length > 0) {
    await db
      .delete(inventoryItems)
      .where(inArray(inventoryItems.productId, productIds));
    await db.delete(products).where(inArray(products.id, productIds));
  }
  await db.delete(addresses).where(eq(addresses.userId, user.id));
  await db.delete(users).where(eq(users.id, user.id));
  await db.$client.end();
}
