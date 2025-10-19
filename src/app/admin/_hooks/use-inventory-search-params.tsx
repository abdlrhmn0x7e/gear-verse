import { useQueryStates } from "nuqs";
import { createLoader, parseAsString } from "nuqs/server";

const inventorySearchParams = {
  inventorySearch: parseAsString,
};

export function useInventorySearchParams() {
  return useQueryStates(inventorySearchParams, { shallow: true });
}

export const loadInventorySearchParams = createLoader(inventorySearchParams);
