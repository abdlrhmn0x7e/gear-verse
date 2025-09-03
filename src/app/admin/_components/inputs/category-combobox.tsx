"use client";

import * as React from "react";
import {
  Check,
  ChevronRightIcon,
  ChevronsUpDown,
  TagIcon,
  XCircleIcon,
} from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { api } from "~/trpc/react";
import type { Category, CategoryTree } from "~/lib/schemas/category";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Spinner } from "~/components/spinner";
import { Separator } from "~/components/ui/separator";
import { AddCategoryDialog } from "../dialogs/add-category-dialog";

export function CategoryCombobox({
  value,
  setValue,
}: {
  value: number | undefined | null;
  setValue: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  const [open, setOpen] = React.useState(false);
  const { data: categories, isPending: categoriesPending } =
    api.categories.findAll.useQuery();

  const flatCategories = React.useCallback(
    (
      categories: CategoryTree[],
      parentPath: string[] = [],
      flat: Array<Category & { path: string[] }> = [],
    ) => {
      for (const category of categories) {
        const { children, ...item } = category;
        flat.push({
          ...item,
          path: [...parentPath, item.name],
        });

        if (children) {
          flatCategories(children, [...parentPath, item.name], flat);
        }
      }

      return flat;
    },
    [],
  );
  const flattenedCategories = React.useMemo(
    () => flatCategories(categories ?? []),
    [categories, flatCategories],
  );

  if (categoriesPending) {
    return (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="justify-between"
        disabled
      >
        <div className="flex items-center justify-start gap-2">
          <Spinner size="small" />
          Loading categories...
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

  if (!categories) {
    return (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="justify-between"
        disabled
      >
        <div className="flex items-center justify-start gap-2">
          <XCircleIcon size="small" />
          No categories found...
        </div>
        <ChevronsUpDown className="opacity-50" />
      </Button>
    );
  }

  function renderValue(
    value: number,
    flattenedCategories: Array<Category & { path: string[] }>,
  ) {
    const currentCategory = flattenedCategories.find(
      (category) => category.id === value,
    );

    return (
      <div className="flex items-center justify-start">
        {currentCategory?.path.map((p, idx) => (
          <div key={`${p}-${idx}`} className="flex items-center justify-start">
            <span key={p}>{p}</span>
            {idx != currentCategory?.path.length - 1 && (
              <ChevronRightIcon className="opacity-50" />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {value ? (
            renderValue(value, flattenedCategories)
          ) : (
            <span className="text-muted-foreground">Select category...</span>
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Command className="mb-4">
          <CommandInput placeholder="Search category..." className="h-9" />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CategoryComboboxItem
                  key={category.id}
                  category={category}
                  setValue={setValue}
                  setParentComboboxOpen={setOpen}
                  selectedValue={value ?? null}
                />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        <Separator />

        <AddCategoryDialog />
      </PopoverContent>
    </Popover>
  );
}

const CategoryComboboxItem = ({
  category,
  setValue,
  setParentComboboxOpen,
  selectedValue,
  ...props
}: {
  category: CategoryTree;
  setValue: React.Dispatch<React.SetStateAction<number | null>>;
  selectedValue: number | null;
  setParentComboboxOpen: React.Dispatch<React.SetStateAction<boolean>>;
} & React.ComponentProps<typeof CommandItem>) => {
  const [open, setOpen] = React.useState(false);

  function onItemSelect(categoryId: number) {
    setValue(categoryId === selectedValue ? null : categoryId);
    setParentComboboxOpen(false);
  }

  function handleItemSelect(categoryId: number) {
    if (!open) {
      setOpen(true);
      return;
    }

    onItemSelect(categoryId);
  }

  if (!category.children) {
    return (
      <CommandItem
        key={category.id}
        value={`${category.id}-${category.name}`}
        onSelect={() => onItemSelect(category.id)}
        {...props}
      >
        <TagIcon />
        {category.name}
        <Check
          className={cn(
            "ml-auto",
            category.id === selectedValue ? "opacity-100" : "opacity-0",
          )}
        />
      </CommandItem>
    );
  }
  return (
    <Collapsible
      className="group/collapsible [&[data-state=open]>div>svg:first-child]:rotate-90"
      open={open}
      onOpenChange={setOpen}
    >
      <CollapsibleTrigger asChild>
        <CommandItem
          value={`${category.id}-${category.name}`}
          onSelect={() => handleItemSelect(category.id)}
          {...props}
        >
          <ChevronRightIcon
            className="transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          />
          {category.name}
          <Check
            className={cn(
              "ml-auto",
              category.id === selectedValue ? "opacity-100" : "opacity-0",
            )}
          />
        </CommandItem>
      </CollapsibleTrigger>

      <CollapsibleContent className="pl-6">
        {category.children.map((child) => (
          <CategoryComboboxItem
            key={child.id}
            category={child}
            setValue={setValue}
            setParentComboboxOpen={setParentComboboxOpen}
            selectedValue={selectedValue}
            {...props}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};
