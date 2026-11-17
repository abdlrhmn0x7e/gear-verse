import { data } from "~/server/data-access";
import { tryCatch } from "~/lib/utils/try-catch";
import {
  orderMessageItems,
  orderMessageVariant,
  renderOrderMessage,
} from "~/lib/order-message";
import { SHIPPING_RATES } from "~/lib/shipping-rates";
import { toWhatsAppNumber, whatsAppLink } from "~/lib/whatsapp";
import arCheckout from "~/messages/ar/checkout.json";
import { withDefaultTemplates } from "./settings";
import {
  comparePeriods,
  fillBuckets,
  getDashboardWindow,
  type DashboardRange,
} from "../helpers/dashboard-range";

const QUEUE_SIZE = 6;
const LOW_STOCK_LIST_SIZE = 5;
const TOP_PRODUCTS_SIZE = 5;
const REVIEWS_SIZE = 3;

export const _dashboard = {
  queries: {
    revenue: async (range: DashboardRange) => {
      const window = getDashboardWindow(range);
      const rows = await data.admin.dashboard.queries.revenue(window);

      const current = rows.filter((row) => row.period === "current");
      const total = current.reduce((sum, row) => sum + row.revenue, 0);
      const previous = rows
        .filter((row) => row.period === "previous")
        .reduce((sum, row) => sum + row.revenue, 0);

      return {
        unit: window.unit,
        total,
        previous,
        change: comparePeriods(total, previous),
        // any line counted at today's price because it saved none
        estimated: rows.some((row) => row.estimated),
        buckets: fillBuckets(
          window.bucketKeys,
          current.map((row) => ({ key: row.key, value: row.revenue })),
        ),
      };
    },

    orders: async (range: DashboardRange) => {
      const window = getDashboardWindow(range);
      const { count, value, previousCount } =
        await data.admin.dashboard.queries.orders(window);

      return {
        count,
        previous: previousCount,
        change: comparePeriods(count, previousCount),
        averageOrderValue: count > 0 ? Math.round(value / count) : 0,
      };
    },

    pending: async () => {
      const [summary, orders, templates] = await Promise.all([
        data.admin.dashboard.queries.pendingSummary(),
        data.admin.dashboard.queries.pendingOrders(QUEUE_SIZE),
        // the defaults while the settings table or column is missing
        tryCatch(data.admin.settings.queries.findOrderMessageTemplates()).then(
          ({ data: saved }) => withDefaultTemplates(saved),
        ),
      ]);

      return {
        ...summary,
        orders: orders.map(({ backordered, ...order }) => {
          const number = order.phoneNumber
            ? toWhatsAppNumber(order.phoneNumber)
            : null;
          const message = renderOrderMessage(
            templates[
              orderMessageVariant({
                paymentMethod: order.paymentMethod,
                backordered,
              })
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
            whatsApp: number ? whatsAppLink(number, message) : null,
          };
        }),
      };
    },

    lowStock: async () => {
      const threshold = await data.admin.dashboard.queries.lowStockThreshold();
      const stock = await data.admin.dashboard.queries.lowStock({
        threshold,
        limit: LOW_STOCK_LIST_SIZE,
      });

      return { threshold, ...stock };
    },

    topProducts: async (range: DashboardRange) => {
      const { start, end } = getDashboardWindow(range);
      return data.admin.dashboard.queries.topProducts({
        start,
        end,
        limit: TOP_PRODUCTS_SIZE,
      });
    },

    reviews: async (range: DashboardRange) => {
      const { start, end } = getDashboardWindow(range);
      return data.admin.dashboard.queries.latestReviews({
        start,
        end,
        limit: REVIEWS_SIZE,
      });
    },
  },
};

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
