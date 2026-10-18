"use client";

import { useState } from "react";
import {
  createFilterQuery,
  createFilterRule,
  flattenFilterRules,
  type FilterField,
  type FilterQuery,
  type FilterRule,
} from "~/components/reui/filters/filters";

/** A filter as the URL holds it: one rule per field, with a value. */
export type CommittedFilter = {
  field: string;
  operator: string;
  value: string | string[];
};

function filtersKey(filters: CommittedFilter[]) {
  return JSON.stringify(
    [...filters]
      .sort((a, b) => a.field.localeCompare(b.field))
      .map(({ field, operator, value }) => [field, operator, value]),
  );
}

function hasValue(value: unknown) {
  return Array.isArray(value)
    ? value.length > 0
    : value !== undefined && value !== null && value !== "";
}

function toRules(filters: CommittedFilter[]) {
  return filters.map((filter) =>
    createFilterRule<string | string[]>({
      id: filter.field,
      path: [filter.field],
      operator: filter.operator,
      value: filter.value,
    }),
  );
}

/**
 * Holds the chip row's query for filters that live in the URL. A chip only
 * reaches the URL once it has a value; until then it stays here, so adding a
 * filter does not refetch the list for nothing. When the URL changes on its
 * own (Back, a pasted link) the chips are rebuilt from it.
 *
 * Each field can be used once, because each search param holds one filter:
 * a field that already has a chip is disabled in the picker.
 */
export function useFilterQuery({
  fields,
  committed,
  onCommit,
}: {
  fields: FilterField<string | string[]>[];
  committed: CommittedFilter[];
  onCommit: (filters: CommittedFilter[]) => void;
}) {
  const key = filtersKey(committed);
  const [syncedKey, setSyncedKey] = useState(key);
  const [query, setQuery] = useState<FilterQuery<string | string[]>>(() =>
    createFilterQuery(toRules(committed)),
  );

  if (key !== syncedKey) {
    setSyncedKey(key);
    // Unfinished chips survive; finished ones are whatever the URL now says.
    const drafts = flattenFilterRules(query).filter(
      (rule) =>
        !hasValue(rule.value) &&
        !committed.some((filter) => filter.field === rule.path[0]),
    );
    setQuery(createFilterQuery([...toRules(committed), ...drafts]));
  }

  function onQueryChange(next: FilterQuery<string | string[]>) {
    setQuery(next);
    const filters = flattenFilterRules(next)
      .filter(
        (rule): rule is FilterRule<string | string[]> & { path: [string] } =>
          rule.operator !== "" && !rule.negated && hasValue(rule.value),
      )
      .map((rule) => ({
        field: rule.path[0],
        operator: rule.operator,
        value: rule.value!,
      }));
    const nextKey = filtersKey(filters);
    if (nextKey === syncedKey) return;
    setSyncedKey(nextKey);
    onCommit(filters);
  }

  const used = new Set(flattenFilterRules(query).map((rule) => rule.path[0]));
  const available = fields.map((field) =>
    used.has(field.id) ? { ...field, disabled: true } : field,
  );

  return { query, onQueryChange, fields: available };
}
