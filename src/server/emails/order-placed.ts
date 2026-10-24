import * as Sentry from "@sentry/nextjs";
import { Resend } from "resend";
import { env } from "~/env";
import { formatCurrency } from "~/lib/utils/format-currency";
import { humanizeString } from "~/lib/utils/humanize-string";
import { data } from "~/server/data-access";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

type OrderDetails = NonNullable<
  Awaited<ReturnType<typeof data.admin.orders.queries.findDetailsById>>
>;

/**
 * Emails the addresses in Store settings about a new order. Runs after the
 * checkout response, so it never throws: a failed email must not look like a
 * failed order. Without Resend configured or any address saved, it sends nothing.
 */
export async function sendOrderPlacedEmail(orderId: number) {
  if (!resend || !env.ORDER_EMAIL_FROM) return;

  try {
    const [to, order] = await Promise.all([
      data.admin.settings.queries.findOrderNotificationEmails(),
      data.admin.orders.queries.findDetailsById(orderId),
    ]);
    if (to.length === 0 || !order) return;

    const { subject, html, text } = renderOrderPlacedEmail(
      order,
      env.NEXT_PUBLIC_APP_URL,
    );
    const { error } = await resend.emails.send(
      {
        from: env.ORDER_EMAIL_FROM,
        to,
        subject,
        html,
        text,
        tags: [{ name: "category", value: "order_placed" }],
      },
      { idempotencyKey: `order-placed/${orderId}` },
    );
    if (error) {
      throw new Error(`Resend: ${error.name}: ${error.message}`);
    }
  } catch (error) {
    console.error(`Order #${orderId} email failed`, error);
    Sentry.captureException(error, { extra: { orderId } });
  }
}

const COLORS = {
  page: "#f5f5f7",
  card: "#ffffff",
  text: "#1d1d1f",
  muted: "#6e6e73",
  hairline: "#e6e6e8",
  well: "#f5f5f7",
  // --primary, the plum
  brand: "#501854",
};

// single quotes inside: it goes into a double-quoted style attribute
const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** The admin's order email: subject, HTML and a plain-text twin. */
export function renderOrderPlacedEmail(order: OrderDetails, appUrl: string) {
  const base = appUrl.replace(/\/+$/, "");
  const orderUrl = `${base}/admin/orders?orderId=${order.id}`;
  const settingsUrl = `${base}/admin/settings`;

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const customer = order.address?.fullName ?? order.user?.name ?? "A customer";
  const payment =
    order.paymentMethod === "COD" ? "Cash on delivery" : "Online payment";
  const summary = `${customer} ordered ${itemCount} ${itemCount === 1 ? "item" : "items"} for ${formatCurrency(subtotal)}.`;

  const addressLines = order.address
    ? [
        order.address.fullName,
        order.address.address,
        order.address.buildingNameOrNumber,
        `${order.address.city}, ${humanizeString(order.address.governorate, "snake")}`,
      ]
    : [];

  const subject = `New order #${order.id} · ${formatCurrency(subtotal)}`;

  const e = escapeHtml;
  const itemRows = order.items
    .map((item) => {
      const options = item.values?.length ? item.values.join(" · ") : null;
      const thumbnail = item.thumbnailUrl?.startsWith("https://")
        ? `<img src="${e(item.thumbnailUrl)}" width="56" height="56" alt="" style="display:block;width:56px;height:56px;border-radius:12px;object-fit:cover;background:${COLORS.well};">`
        : `<div style="width:56px;height:56px;border-radius:12px;background:${COLORS.well};"></div>`;

      return `
        <tr>
          <td width="56" valign="top" style="padding:16px 0;">${thumbnail}</td>
          <td valign="top" style="padding:16px 16px;">
            <div style="font-size:15px;line-height:20px;font-weight:600;color:${COLORS.text};">${e(item.title)}</div>
            ${options ? `<div style="font-size:13px;line-height:18px;color:${COLORS.muted};padding-top:2px;">${e(options)}</div>` : ""}
            <div style="font-size:13px;line-height:18px;color:${COLORS.muted};padding-top:2px;">Qty ${item.quantity}</div>
          </td>
          <td valign="top" align="right" style="padding:16px 0;font-size:15px;line-height:20px;color:${COLORS.text};white-space:nowrap;">${formatCurrency(item.price * item.quantity)}</td>
        </tr>`;
    })
    .join(
      `<tr><td colspan="3" style="border-top:1px solid ${COLORS.hairline};font-size:0;line-height:0;">&nbsp;</td></tr>`,
    );

  const detail = (label: string, body: string) => `
    <tr>
      <td valign="top" width="96" style="padding:6px 0;font-size:13px;line-height:20px;color:${COLORS.muted};">${label}</td>
      <td valign="top" style="padding:6px 0;font-size:15px;line-height:20px;color:${COLORS.text};">${body}</td>
    </tr>`;

  const phone = order.address?.phoneNumber;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${e(subject)}</title>
<style>
  @media (max-width: 480px) {
    .page { padding: 16px 8px !important; }
    .card { padding: 28px 20px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${COLORS.page};font-family:${FONT};-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${e(summary)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.page};">
  <tr>
    <td class="page" align="center" style="padding:40px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr>
          <td class="card" style="background:${COLORS.card};border-radius:20px;padding:40px 32px;">
            <img src="${e(base)}/apple-icon.png" width="40" height="40" alt="Gear Verse" style="display:block;width:40px;height:40px;border-radius:10px;">

            <div style="padding-top:28px;font-size:13px;line-height:18px;color:${COLORS.muted};">Order #${order.id}</div>
            <h1 style="margin:4px 0 0;font-size:28px;line-height:34px;font-weight:600;letter-spacing:-0.02em;color:${COLORS.text};">New order.</h1>
            <p style="margin:8px 0 0;font-size:17px;line-height:25px;color:${COLORS.text};">${e(summary)}</p>

            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
              <tr>
                <td style="border-radius:980px;background:${COLORS.brand};">
                  <a href="${e(orderUrl)}" style="display:inline-block;padding:11px 22px;font-size:15px;line-height:20px;font-weight:500;color:#ffffff;text-decoration:none;border-radius:980px;">Review order</a>
                </td>
              </tr>
            </table>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;border-top:1px solid ${COLORS.hairline};">
              ${itemRows}
            </table>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${COLORS.hairline};">
              <tr>
                <td style="padding:16px 0 4px;font-size:15px;line-height:20px;color:${COLORS.muted};">Subtotal</td>
                <td align="right" style="padding:16px 0 4px;font-size:15px;line-height:20px;font-weight:600;color:${COLORS.text};white-space:nowrap;">${formatCurrency(subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:4px 0 0;font-size:13px;line-height:18px;color:${COLORS.muted};">Shipping</td>
                <td align="right" style="padding:4px 0 0;font-size:13px;line-height:18px;color:${COLORS.muted};">Set when you confirm</td>
              </tr>
            </table>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border-top:1px solid ${COLORS.hairline};padding-top:18px;">
              ${addressLines.length ? detail("Deliver to", addressLines.map(e).join("<br>")) : ""}
              ${phone ? detail("Phone", `<a href="tel:${e(phone)}" style="color:${COLORS.text};text-decoration:none;">${e(phone)}</a>`) : ""}
              ${detail("Payment", payment)}
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:24px 16px 0;font-size:12px;line-height:18px;color:${COLORS.muted};">
            You get these because your address is in
            <a href="${e(settingsUrl)}" style="color:${COLORS.muted};text-decoration:underline;">Store settings</a>.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    `New order #${order.id}`,
    summary,
    "",
    ...order.items.map((item) => {
      const options = item.values?.length ? ` (${item.values.join(", ")})` : "";
      return `${item.quantity} × ${item.title}${options}  ${formatCurrency(item.price * item.quantity)}`;
    }),
    "",
    `Subtotal: ${formatCurrency(subtotal)}`,
    "Shipping: set when you confirm",
    "",
    ...(addressLines.length ? ["Deliver to:", ...addressLines, ""] : []),
    ...(phone ? [`Phone: ${phone}`] : []),
    `Payment: ${payment}`,
    "",
    `Review order: ${orderUrl}`,
  ].join("\n");

  return { subject, html, text };
}
