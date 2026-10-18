"use client";

import {
  CircleCheckIcon,
  CircleSlashIcon,
  ShieldIcon,
  ShieldUserIcon,
  SquareDashedIcon,
  UserIcon,
} from "lucide-react";
import { useUserSearchParams } from "~/app/admin/_hooks/use-user-search-params";
import {
  useFilterQuery,
  type CommittedFilter,
} from "~/app/admin/_hooks/use-filter-query";
import { Filters, type FilterField } from "~/components/reui/filters/filters";
import { userRoles, userStatuses } from "~/lib/schemas/contracts/admin/users";
import { cn } from "~/lib/utils";
import { SearchInput } from "../../inputs/search-input";

export const userRoleMap = {
  user: { label: "Customer", icon: <UserIcon /> },
  admin: { label: "Admin", icon: <ShieldUserIcon /> },
} as const;

const userStatusMap = {
  active: { label: "Active", icon: <CircleCheckIcon /> },
  banned: { label: "Banned", icon: <CircleSlashIcon /> },
} as const;

// The server takes one role and one status, so "is" is the only condition
// either offers.
const is = [{ value: "is", label: "is" }];

const fields: FilterField<string | string[]>[] = [
  {
    id: "role",
    label: "Role",
    icon: <ShieldIcon />,
    type: "select",
    operators: is,
    searchable: false,
    options: userRoles.map((role) => ({ value: role, ...userRoleMap[role] })),
  },
  {
    id: "status",
    label: "Status",
    icon: <SquareDashedIcon />,
    type: "select",
    operators: is,
    searchable: false,
    options: userStatuses.map((status) => ({
      value: status,
      ...userStatusMap[status],
    })),
  },
];

function pick<T extends string>(
  filters: CommittedFilter[],
  field: string,
  allowed: readonly T[],
): T | null {
  const value = filters.find((filter) => filter.field === field)?.value;
  return allowed.find((item) => item === value) ?? null;
}

/** Name or email search plus role and status chips, all held in the users search params. */
export function UsersFilters({ className }: { className?: string }) {
  const [filters, setFilters] = useUserSearchParams();

  const committed: CommittedFilter[] = [];
  if (filters.role) {
    committed.push({ field: "role", operator: "is", value: filters.role });
  }
  if (filters.status) {
    committed.push({ field: "status", operator: "is", value: filters.status });
  }

  const chips = useFilterQuery({
    fields,
    committed,
    onCommit: (next) =>
      void setFilters({
        role: pick(next, "role", userRoles),
        status: pick(next, "status", userStatuses),
      }),
  });

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center",
        className,
      )}
    >
      <SearchInput
        className="w-full sm:max-w-xs"
        placeholder="Search by name or email"
        value={filters.search ?? ""}
        onChange={(event) =>
          void setFilters({ search: event.target.value || null })
        }
      />
      <Filters
        fields={chips.fields}
        query={chips.query}
        onQueryChange={chips.onQueryChange}
        ruleMenu="remove"
        showClear
        // A chip reads as one phrase, so it wraps as a whole, never inside.
        className="[&_[data-slot=filter-chip]]:whitespace-nowrap"
      />
    </div>
  );
}
