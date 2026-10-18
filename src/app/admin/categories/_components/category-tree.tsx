"use client";

import { ChevronRight, FolderIcon } from "lucide-react";
import { type ElementType, createElement, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { iconsMap } from "~/lib/icons-map";
import { cn } from "~/lib/utils";
import {
  DragableItem,
  Droppable,
} from "~/app/admin/_components/dragable-context";
import { useCategoryStore } from "../_store/provider";
import { AddCategory } from "./add-category";
import { EditCategory } from "./edit-category";
import type { CategoryTree } from "~/lib/schemas/entities/category";
import { CategoryTreeActions } from "./category-tree-actions";
import { Skeleton } from "~/components/ui/skeleton";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { IconFolderX } from "@tabler/icons-react";

/** A category's icon, or a folder for an icon the map doesn't know. */
export function CategoryIcon({
  icon,
  className,
}: {
  icon: CategoryTree["icon"];
  className?: string;
}) {
  const component: ElementType<{ className?: string }> =
    iconsMap.get(icon) ?? FolderIcon;
  return createElement(component, { className });
}

export function findCategory(
  nodes: CategoryTree[],
  id: number,
): CategoryTree | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const inChild = node.children ? findCategory(node.children, id) : undefined;
    if (inChild) return inChild;
  }
  return undefined;
}

export function findParentCategory(
  nodes: CategoryTree[],
  id: number,
  parent?: CategoryTree,
): CategoryTree | undefined {
  for (const node of nodes) {
    if (node.id === id) return parent;
    const found = node.children
      ? findParentCategory(node.children, id, node)
      : undefined;
    if (found) return found;
  }
  return undefined;
}

export function countCategories(nodes: CategoryTree[]): number {
  return nodes.reduce(
    (count, node) => count + 1 + countCategories(node.children ?? []),
    0,
  );
}

/** The branches holding a category whose name matches, each cut down to those matches. */
export function filterCategories(
  nodes: CategoryTree[],
  query: string,
): CategoryTree[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return nodes;

  return nodes.flatMap((node) => {
    if (node.name.toLowerCase().includes(needle)) return [node];
    const children = filterCategories(node.children ?? [], needle);
    return children.length > 0 ? [{ ...node, children }] : [];
  });
}

/**
 * One category and, folded under it, its sub-categories. A row selects the
 * category, drags onto another to nest under it, and takes dropped products.
 */
export function CategoryTree({
  categories,
  parentCategory,
  defaultOpen = false,
}: {
  categories: CategoryTree;
  parentCategory?: CategoryTree;
  /** Unfold the whole branch, e.g. to show search matches. */
  defaultOpen?: boolean;
}) {
  const { children } = categories;
  const hasChildren = !!children && children.length > 0;

  if (!hasChildren) {
    return (
      <CategoryTreeItem
        categories={categories}
        parentCategory={parentCategory}
      />
    );
  }

  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CategoryTreeItem
        categories={categories}
        parentCategory={parentCategory}
      />

      <CollapsibleContent className="border-border/70 ml-[1.0625rem] flex flex-col gap-px border-l pt-px pl-1.5">
        {children.map((subCategory) => (
          <CategoryTree
            key={subCategory.id}
            categories={subCategory}
            parentCategory={categories}
            defaultOpen={defaultOpen}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function CategoryTreeItem({
  categories,
  parentCategory,
}: {
  categories: CategoryTree;
  parentCategory?: CategoryTree;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const selectedCategoryId = useCategoryStore(
    (state) => state.selectedCategoryId,
  );
  const setSelectedCategoryId = useCategoryStore(
    (state) => state.setSelectedCategoryId,
  );

  const { children, ...category } = categories;
  const isActive = selectedCategoryId === category.id;
  const hasChildren = !!children && children.length > 0;

  if (showEditForm) {
    return (
      <div className="py-1 pl-1">
        <EditCategory
          id={category.id}
          defaultValues={{
            icon: category.icon,
            name: category.name,
            parent_id: parentCategory?.id,
          }}
          onSuccess={() => setShowEditForm(false)}
          cancel={() => setShowEditForm(false)}
        />
      </div>
    );
  }

  return (
    <>
      <Droppable
        id={`category:${category.id}`}
        className="rounded-lg"
        classNameWhenOver="bg-accent ring-2 ring-primary/30"
      >
        <DragableItem
          id={`category:${category.id}`}
          withHandle
          handleClassName="text-muted-foreground order-last opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          className={cn(
            "hover:bg-accent/60 flex h-8 items-center gap-1 rounded-lg pr-1 pl-0.5 text-sm transition-colors",
            isActive && "bg-accent hover:bg-accent text-foreground font-medium",
          )}
        >
          {hasChildren ? (
            <CollapsibleTrigger
              aria-label={`Show sub-categories of ${category.name}`}
              className="text-muted-foreground hover:text-foreground flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md focus-visible:outline-none [&[data-state=open]>svg]:rotate-90"
            >
              <ChevronRight className="size-4 transition-transform" />
            </CollapsibleTrigger>
          ) : (
            <span className="size-6 shrink-0" />
          )}

          <button
            type="button"
            onClick={() => setSelectedCategoryId(category.id)}
            aria-current={isActive ? "true" : undefined}
            className="flex h-full min-w-0 flex-1 cursor-pointer items-center gap-2 text-left focus-visible:outline-none"
          >
            <CategoryIcon
              icon={category.icon}
              className={cn(
                "size-4 shrink-0",
                !isActive && "text-muted-foreground",
              )}
            />
            <span className="truncate">{category.name}</span>
          </button>

          <CategoryTreeActions
            categoryId={category.id}
            setShowAddForm={setShowAddForm}
            setShowEditForm={setShowEditForm}
          />
        </DragableItem>
      </Droppable>

      {showAddForm && (
        <div className="py-1 pl-7">
          <AddCategory
            parentCategoryId={category.id}
            onSuccess={() => setShowAddForm(false)}
            cancel={() => setShowAddForm(false)}
          />
        </div>
      )}
    </>
  );
}

export function CategoryTreeSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 px-1">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-7 w-full" />
      ))}
    </div>
  );
}

export function CategoryTreeEmptyState({
  searched = false,
}: {
  searched?: boolean;
}) {
  return (
    <Empty className="py-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconFolderX />
        </EmptyMedia>
        <EmptyTitle>
          {searched ? "No matching categories" : "No categories found"}
        </EmptyTitle>
        <EmptyDescription>
          {searched
            ? "Try a different name."
            : "Get started by adding your first category."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
