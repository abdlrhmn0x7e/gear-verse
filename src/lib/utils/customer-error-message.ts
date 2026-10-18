type ClientError = {
  message: string;
  data?: { code?: string; zodError?: unknown } | null;
};

/** bad requests carry a message meant for the customer (e.g. stock), anything else gets the fallback */
export function getCustomerErrorMessage(error: ClientError, fallback: string) {
  return error.data?.code === "BAD_REQUEST" && !error.data.zodError
    ? error.message
    : fallback;
}
