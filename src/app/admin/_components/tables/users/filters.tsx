"use client";

import {
  CircleCheckIcon,
  CircleSlashIcon,
  ShieldUserIcon,
  UserIcon,
} from "lucide-react";
import { useUserSearchParams } from "~/app/admin/_hooks/use-user-search-params";
import { userRoles, userStatuses } from "~/lib/schemas/contracts/admin/users";
import { FilterPill } from "../../filter-pill";
import { SearchInput } from "../../inputs/search-input";

export const userRoleMap = {
  user: { label: "Customer", icon: <UserIcon /> },
  admin: { label: "Admin", icon: <ShieldUserIcon /> },
} as const;

const userStatusMap = {
  active: { label: "Active", icon: <CircleCheckIcon /> },
  banned: { label: "Banned", icon: <CircleSlashIcon /> },
} as const;

/** Name or email search plus role and status pills, all held in the users search params. */
export function UsersFilters() {
  const [filters, setFilters] = useUserSearchParams();

  return (
    <>
      <SearchInput
        className="w-full sm:w-64"
        placeholder="Search by name or email"
        aria-label="Search users by name or email"
        value={filters.search ?? ""}
        onChange={(event) =>
          void setFilters({ search: event.target.value || null })
        }
      />
      <FilterPill
        label="Role"
        value={filters.role}
        options={userRoles.map((role) => ({
          value: role,
          ...userRoleMap[role],
        }))}
        onChange={(role) => void setFilters({ role })}
      />
      <FilterPill
        label="Status"
        value={filters.status}
        options={userStatuses.map((status) => ({
          value: status,
          ...userStatusMap[status],
        }))}
        onChange={(status) => void setFilters({ status })}
      />
    </>
  );
}
