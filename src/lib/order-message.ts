/**
 * The WhatsApp message the team sends to confirm an order. There is one
 * template per payment method and stock situation, edited in the store
 * settings, with `{{placeholder}}` tokens filled in per order.
 */

export const orderMessageVariants = [
  "cod",
  "codBackorder",
  "online",
  "onlineBackorder",
] as const;
export type OrderMessageVariant = (typeof orderMessageVariants)[number];
export type OrderMessageTemplates = Record<OrderMessageVariant, string>;

export const orderMessageVariantLabels: Record<
  OrderMessageVariant,
  { label: string; description: string }
> = {
  cod: {
    label: "Cash on delivery",
    description: "Every item is in stock and the customer pays on delivery.",
  },
  codBackorder: {
    label: "Cash on delivery, backorder",
    description:
      "At least one item is out of stock and sourced for the order, paid on delivery.",
  },
  online: {
    label: "Paid online",
    description: "Every item is in stock and the order is already paid.",
  },
  onlineBackorder: {
    label: "Paid online, backorder",
    description:
      "At least one item is out of stock and sourced for the order, already paid.",
  },
};

export const orderMessagePlaceholders = [
  {
    key: "items",
    label: "Items",
    sample:
      "• 1x TANGZU WanerSG II Red Lion 3.5mm with mic\n• 1x Moondrop Chu II",
  },
  {
    key: "in_stock_items",
    label: "In-stock items",
    sample: "• 1x TANGZU WanerSG II Red Lion 3.5mm with mic",
  },
  {
    key: "backordered_items",
    label: "Backordered items",
    sample: "• 1x Moondrop Chu II",
  },
  { key: "name", label: "Name", sample: "Mohamed Ahmed" },
  { key: "phone", label: "Phone", sample: "+201125117663" },
  {
    key: "address",
    label: "Address",
    sample:
      "145 محور طه حسين، التجمع الأول، مبنى 145، الدور 3، شقة 7، مدينة القاهرة الجديدة، القاهرة، أمام أكاديمية الشرطة",
  },
  { key: "shipping_fee", label: "Shipping fee", sample: "120" },
  { key: "total", label: "Order total", sample: "1,450" },
  { key: "order_id", label: "Order number", sample: "1042" },
] as const;
export type OrderMessagePlaceholder =
  (typeof orderMessagePlaceholders)[number]["key"];
export type OrderMessageValues = Record<OrderMessagePlaceholder, string>;

export const orderMessageSampleValues = Object.fromEntries(
  orderMessagePlaceholders.map(({ key, sample }) => [key, sample]),
) as OrderMessageValues;

/** `{{key}}`; a key outside the placeholder list is left as typed. */
export const PLACEHOLDER_PATTERN = /\{\{(\w+)\}\}/g;

export function isOrderMessagePlaceholder(
  key: string,
): key is OrderMessagePlaceholder {
  return orderMessagePlaceholders.some(
    (placeholder) => placeholder.key === key,
  );
}

export function renderOrderMessage(
  template: string,
  values: OrderMessageValues,
) {
  return template.replace(PLACEHOLDER_PATTERN, (token, key: string) =>
    isOrderMessagePlaceholder(key) ? values[key] : token,
  );
}

type MessageLine = {
  title: string;
  quantity: number;
  /** units sourced for the order, not taken from stock */
  backorderedQuantity: number;
};

/**
 * The three item lists a message can show: every line, the units taken from
 * stock, and the units sourced for the order. A line that is partly
 * backordered shows in both of the last two with its own count.
 */
export function orderMessageItems(lines: MessageLine[]) {
  const list = (pick: (line: MessageLine) => number) =>
    lines
      .filter((line) => pick(line) > 0)
      .map((line) => `• ${pick(line)}x ${line.title}`)
      .join("\n");

  return {
    items: list((line) => line.quantity),
    in_stock_items: list((line) => line.quantity - line.backorderedQuantity),
    backordered_items: list((line) => line.backorderedQuantity),
  };
}

export function orderMessageVariant({
  paymentMethod,
  backordered,
}: {
  paymentMethod: "COD" | "ONLINE";
  backordered: boolean;
}): OrderMessageVariant {
  const base = paymentMethod === "COD" ? "cod" : "online";
  return backordered ? `${base}Backorder` : base;
}

const greeting = `السلام عليكم،
بتواصل مع حضرتك من GearVerse لتأكيد أوردر:

{{items}}`;

const backorderNote = `

دول مش متوفرين في المخزن حالياً، بس نقدر نوفّرهملك. هنبلغ حضرتك بميعاد التوصيل المتوقع:
{{backordered_items}}`;

const customer = `

الاسم: {{name}}
رقم الموبايل: {{phone}}
العنوان: {{address}}`;

const shippingFee = `

هستأذنك تحول مصاريف الشحن فقط {{shipping_fee}}ج على إنستا باي 01060902778 لتأكيد الأوردر.`;

export const defaultOrderMessageTemplates: OrderMessageTemplates = {
  cod: greeting + customer + shippingFee,
  codBackorder: greeting + backorderNote + customer + shippingFee,
  online: greeting + customer,
  onlineBackorder: greeting + backorderNote + customer,
};
