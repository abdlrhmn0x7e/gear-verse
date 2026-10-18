import type { NextRequest } from "next/server";
import { getStoreSettings } from "~/lib/store-settings";
import { requestItemMessage, whatsAppLink } from "~/lib/whatsapp";

/**
 * Every "Request an item" entry point links here, with what the customer typed or searched for in `?item=`,
 * and lands in a WhatsApp chat with the request already written. One URL keeps the store's number out of
 * client code and leaves a single place to count requests later. Until a number is set, the FAQ's contact
 * line is the closest way to reach the team.
 */
export async function GET(request: NextRequest) {
  const { whatsappNumber } = await getStoreSettings();
  if (!whatsappNumber) {
    return Response.redirect(new URL("/#faq", request.url), 307);
  }

  const item = request.nextUrl.searchParams.get("item");
  return Response.redirect(
    whatsAppLink(whatsappNumber, requestItemMessage(item)),
    307,
  );
}
