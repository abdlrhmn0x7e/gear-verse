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
      <div className="flex items-center justify-start">
        {currentCategory?.path.map((p, idx) => {
          const Icon = iconsMap.get(p.icon);

          return (
            <div
              key={`${p.name}-${idx}`}
              className="flex items-center justify-start"
            >
              {Icon && <Icon className="mr-1 size-4" />}
              <span>{p.name}</span>
              {idx != currentCategory?.path.length - 1 && (
                <ChevronRightIcon className="opacity-50" />
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
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {value ? (
            renderValue(value, flattenedCategories)
          ) : (
            <div className="text-muted-foreground flex items-center gap-2">
              <TagIcon className="size-4" />
              <span>Select category...</span>
            </div>
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <CategoriesCommand
          categories={categories}
          setValue={(value) => onValueChange(value ?? null)}
          setOpen={setOpen}
          value={value ?? null}
        />
      </PopoverContent>
    </Popover>
  );
}

export function CategoriesCommand({
  categories,
  setValue,
  setOpen,
  value,
}: {
  categories: CategoryTree[];
  setValue: (value: number) => void;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  value: number | null;
}) {
  return (
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
  setValue: (value: number) => void;
  selectedValue: number | null;
  setParentComboboxOpen: React.Dispatch<React.SetStateAction<boolean>>;
} & React.ComponentProps<typeof CommandItem>) => {
  const [open, setOpen] = React.useState(false);
  const Icon = iconsMap.get(category.icon);

  function onItemSelect(categoryId: number) {
    setValue(categoryId);
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
        {/*eslint-disable-next-line react-hooks/static-components*/}
        {Icon && <Icon />}
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
          {/*eslint-disable-next-line react-hooks/static-components*/}
          {Icon && <Icon />}
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
