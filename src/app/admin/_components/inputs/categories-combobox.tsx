"use client";

import * as React from "react";
import { ChevronRightIcon, TagIcon, XCircleIcon } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandTrigger,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useTRPC } from "~/trpc/client";
import type {
  Category,
  CategoryIconEnum,
  CategoryTree,
} from "~/lib/schemas/entities/category";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Spinner } from "~/components/spinner";
import { iconsMap } from "~/lib/icons-map";
import { useFlatCategories } from "~/hooks/use-flat-categories";
import { useQuery } from "@tanstack/react-query";
import { AddCategoryDrawer } from "../drawers/add-category";

export function CategoriesCombobox({
  value,
  onValueChange,
}: {
  value: number | undefined | null;
  onValueChange: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  const [open, setOpen] = React.useState(false);
  const trpc = useTRPC();
  const { data: categories, isPending: categoriesPending } = useQuery(
    trpc.admin.categories.queries.findAll.queryOptions(),
  );

  const flattenedCategories = useFlatCategories(categories ?? []);

  if (categoriesPending) {
    return (
      <CommandTrigger disabled>
        <Spinner size="small" />
        <span className="text-muted-foreground truncate">
          Loading categories
        </span>
      </CommandTrigger>
    );
  }

  if (!categories) {
    return (
      <CommandTrigger aria-invalid disabled>
        <XCircleIcon className="text-destructive" />
        <span className="truncate">Couldn&apos;t load categories</span>
      </CommandTrigger>
    );
  }

  function renderValue(
    value: number,
    flattenedCategories: Array<
      Omit<Category, "updated_at"> & {
        path: { icon: CategoryIconEnum; name: string }[];
      }
    >,
  ) {
    const currentCategory = flattenedCategories.find(
      (category) => category.id === value,
    );

    return (
      <div className="flex min-w-0 items-center justify-start overflow-hidden">
        {currentCategory?.path.map((p, idx) => {
          const Icon = iconsMap.get(p.icon);

          return (
            <div
              key={`${p.name}-${idx}`}
              className="flex min-w-0 items-center justify-start"
            >
              {Icon && <Icon className="mr-1 size-4 shrink-0" />}
              <span className="truncate">{p.name}</span>
              {idx != currentCategory?.path.length - 1 && (
                <ChevronRightIcon className="text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <CommandTrigger aria-expanded={open}>
          {value ? (
            renderValue(value, flattenedCategories)
          ) : (
            <>
              <TagIcon className="text-muted-foreground" />
              <span className="text-muted-foreground truncate">
                Select a category
              </span>
            </>
          )}
        </CommandTrigger>
      </PopoverTrigger>

      <PopoverContent>
        <CategoriesCommand
          categories={categories}
          setValue={(value) => onValueChange(value ?? null)}
          setOpen={setOpen}
          value={value ?? null}
        />

        <CommandFooter>
          <AddCategoryDrawer />
        </CommandFooter>
      </PopoverContent>
    </Popover>
  );
}

export function CategoriesCommand({
  categories,
  setValue,
  value,
}: {
  categories: CategoryTree[];
  setValue: (value: number) => void;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  value: number | null;
}) {
  return (
    <Command>
      <CommandInput placeholder="Search categories" />
      <CommandList>
        <CommandEmpty>No categories found</CommandEmpty>
        <CommandGroup>
          {categories.map((category) => (
            <CategoryComboboxItem
              key={category.id}
              category={category}
              setValue={setValue}
              selectedValue={value ?? null}
            />
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

const CategoryComboboxItem = ({
  category,
  setValue,
  selectedValue,
  ...props
}: {
  category: CategoryTree;
  setValue: (value: number) => void;
  selectedValue: number | null;
} & React.ComponentProps<typeof CommandItem>) => {
  const Icon = iconsMap.get(category.icon);

  function onItemSelect(categoryId: number) {
    setValue(categoryId);
  }

  if (!category.children) {
    return (
      <CommandItem
        key={category.id}
        value={`${category.id}-${category.name}`}
        data-checked={category.id === selectedValue}
        onSelect={() => onItemSelect(category.id)}
        {...props}
      >
        {/*eslint-disable-next-line react-hooks/static-components*/}
        {Icon && <Icon />}
        <span className="truncate">{category.name}</span>
      </CommandItem>
    );
  }
  return (
    <Collapsible className="group/collapsible [&[data-state=open]>div>button>svg:first-child]:rotate-90">
      <CommandItem
        value={`${category.id}-${category.name}`}
        data-checked={category.id === selectedValue}
        onSelect={() => onItemSelect(category.id)}
        {...props}
      >
        <CollapsibleTrigger onClick={(e) => e.stopPropagation()}>
          <ChevronRightIcon className="transition-transform" />
        </CollapsibleTrigger>
        {/*eslint-disable-next-line react-hooks/static-components*/}
        {Icon && <Icon />}
        <span className="truncate">{category.name}</span>
      </CommandItem>

      <CollapsibleContent className="pl-6">
        {category.children.map((child) => (
          <CategoryComboboxItem
            key={child.id}
            category={child}
            setValue={setValue}
            selectedValue={selectedValue}
            {...props}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};
