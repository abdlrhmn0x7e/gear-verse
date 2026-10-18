import { data } from "~/server/data-access";
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
      const [summary, orders] = await Promise.all([
        data.admin.dashboard.queries.pendingSummary(),
        data.admin.dashboard.queries.pendingOrders(QUEUE_SIZE),
      ]);

      return { ...summary, orders };
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
