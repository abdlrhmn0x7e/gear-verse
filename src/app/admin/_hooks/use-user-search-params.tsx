import { useQueryStates } from "nuqs";
import {
  createLoader,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { userRoles, userStatuses } from "~/lib/schemas/contracts/admin/users";

const userSearchParams = {
  search: parseAsString,
  role: parseAsStringEnum([...userRoles]),
  status: parseAsStringEnum([...userStatuses]),
  /** The user whose orders the drawer shows. */
  ordersOf: parseAsInteger,
};

export function useUserSearchParams() {
  return useQueryStates(userSearchParams, { shallow: true });
}

export const loadUserSearchParams = createLoader(userSearchParams);
