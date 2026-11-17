import {
  orderMessageItems,
  orderMessageVariant,
  renderOrderMessage,
} from "~/lib/order-message";
import { SHIPPING_RATES } from "~/lib/shipping-rates";
import { tryCatch } from "~/lib/utils/try-catch";
import { toWhatsAppNumber, whatsAppLink } from "~/lib/whatsapp";
import arCheckout from "~/messages/ar/checkout.json";
import { data } from "~/server/data-access";
import { withDefaultTemplates } from "../admin/settings";

type ConfirmationOrder = Awaited<
  ReturnType<typeof data.admin.dashboard.queries.confirmationOrders>
>[number];

/**
 * Each order with its confirmation `message` from the store's templates, and
 * `whatsApp`: a wa.me link to its customer with that message typed in, or
 * null when the order has no number to dial.
 */
export async function withWhatsApp(
  ordersPromise: Promise<ConfirmationOrder[]>,
) {
  const [orders, templates] = await Promise.all([
    ordersPromise,
    // the defaults while the settings table or column is missing
    tryCatch(data.admin.settings.queries.findOrderMessageTemplates()).then(
      ({ data: saved }) => withDefaultTemplates(saved),
    ),
  ]);

  return orders.map(({ backordered, ...order }) => {
    const number = order.phoneNumber
      ? toWhatsAppNumber(order.phoneNumber)
      : null;
    const message = renderOrderMessage(
      templates[
        orderMessageVariant({ paymentMethod: order.paymentMethod, backordered })
      ],
      {
        ...orderMessageItems(order.lines),
        name: order.customerName,
        phone: number ? `+${number}` : (order.phoneNumber ?? ""),
        address: arabicAddressLine(order),
        shipping_fee: order.governorate
          ? String(SHIPPING_RATES[order.governorate])
          : "",
        total: order.total.toLocaleString("en"),
        order_id: String(order.id),
      },
    );

    return {
      ...order,
      message,
      whatsApp: number ? whatsAppLink(number, message) : null,
    };
  });
}

export type OrderConfirmation = { message: string; whatsApp: string | null };

/** The confirmation message and WhatsApp link for the given orders, by id. */
export async function confirmationsById(ids: number[]) {
  if (ids.length === 0) return new Map<number, OrderConfirmation>();
  const orders = await withWhatsApp(
    data.admin.dashboard.queries.confirmationOrders({ ids }),
  );
  return new Map(
    orders.map(({ id, message, whatsApp }) => [id, { message, whatsApp }]),
  );
}

/** "145 محور طه حسين، مبنى 145، الدور 3، شقة 7، مدينة نصر، القاهرة، أمام البنك": the address as the confirmation message writes it. */
function arabicAddressLine(address: {
  address: string | null;
  buildingNameOrNumber: string | null;
  floor: string | null;
  apartment: string | null;
  city: string | null;
  governorate: keyof typeof arCheckout.governorates | null;
  additionalDetails: string | null;
}) {
  const building = address.buildingNameOrNumber?.trim();
  return [
    address.address,
    // older addresses hold free text like "Building 12, floor 3" here
    building && /^\d/.test(building) ? `مبنى ${building}` : building,
    address.floor?.trim() && `الدور ${address.floor.trim()}`,
    address.apartment?.trim() && `شقة ${address.apartment.trim()}`,
    address.city,
    address.governorate && arCheckout.governorates[address.governorate],
    address.additionalDetails,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join("، ");
}
