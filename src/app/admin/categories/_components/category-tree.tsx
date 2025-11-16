"use client";

import { ChevronRight, FolderIcon } from "lucide-react";
import { useRef, useState } from "react";
import { buttonVariants } from "~/components/ui/button";
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
import { createPortal } from "react-dom";
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

export function CategoryTree({
  categories,
  parentCategory,
  isDragging = false,
}: {
  categories: CategoryTree;
  parentCategory?: CategoryTree;
  isDragging?: boolean;
}) {
  const { children, ...category } = categories;
  const hasChildren = children && children.length > 0;

  const addCategoryPortalRef = useRef<HTMLDivElement>(null);

  if (!category) {
    return null;
  }

  if (!hasChildren) {
    return (
      <div ref={addCategoryPortalRef}>
        <CategoryTreeItem
          categories={categories}
          parentCategory={parentCategory}
          addCategoryPortalRef={addCategoryPortalRef}
        />
      </div>
    );
  }

  return (
    <Collapsible
      ref={addCategoryPortalRef}
      className="group/collapsible [&[data-state=open]>div>div>button:nth-child(2)>svg:first-child]:rotate-90"
    >
      <CategoryTreeItem
        categories={categories}
        parentCategory={parentCategory}
        addCategoryPortalRef={addCategoryPortalRef}
      />

      <CollapsibleContent>
        {children?.map((subCategories, index) => (
          <div
            key={`category-tree-${category.id}-${index}`}
            className="mt-1 ml-2"
          >
            <CategoryTree
              categories={subCategories}
              parentCategory={category}
              isDragging={isDragging}
            />
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function CategoryTreeItem({
  categories,
  parentCategory,
  addCategoryPortalRef,
}: {
  categories: CategoryTree;
  parentCategory?: CategoryTree;
  addCategoryPortalRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const selectedCategory = useCategoryStore((state) => state.selectedCategory);
  const setSelectedCategory = useCategoryStore(
    (state) => state.setSelectedCategory,
  );
  const setParentCategory = useCategoryStore(
    (state) => state.setParentCategory,
  );

  const { children, ...category } = categories;
  const Icon = iconsMap.get(category.icon) ?? FolderIcon;
  const isActive = selectedCategory?.id === category.id;
  const hasChildren = children && children.length > 0;

  function handleCategorySelect() {
    setSelectedCategory(category);
    if (parentCategory) {
      setParentCategory(parentCategory);
    }
  }

  function renderCategoryContent() {
    if (showEditForm) {
      return (
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
      );
    }

    return (
      <>
        <button
          onClick={handleCategorySelect}
          className="flex size-full cursor-pointer items-center gap-2 py-2 focus-visible:outline-none"
        >
          <Icon />
          {category.name}
        </button>

        <CategoryTreeActions
          categoryId={category.id}
          setShowAddForm={setShowAddForm}
          setShowEditForm={setShowEditForm}
        />
      </>
    );
  }

  return (
    <Droppable
      id={`category:${category.id}`}
      className="rounded-md"
      classNameWhenOver="ring-2 ring-primary/40 bg-accent/40 rounded-md"
    >
      <DragableItem
        id={`category:${category.id}`}
        className={buttonVariants({
          variant: "ghost",
          className: cn(
            "group w-full justify-between border border-transparent py-0 focus-visible:ring-0",
            isActive && !showEditForm && "border-border bg-background",
            hasChildren && "has-[button>svg]:px-3",
            showEditForm &&
              "hover:text-foreground h-fit hover:bg-transparent dark:hover:bg-transparent [&>button]:hidden [&>svg:nth-child(2)]:hidden",
            "[&>button:first-child]:order-1",
          ),
        })}
        withHandle
      >
        {hasChildren ? (
          <CollapsibleTrigger className="focus-visible:outline-none">
            <ChevronRight className="transition-transform" />
          </CollapsibleTrigger>
        ) : (
          <ChevronRight
            className={cn(
              "opacity-0 transition-all",
              showAddForm && "rotate-90 opacity-100",
            )}
          />
        )}

        {renderCategoryContent()}

        {showAddForm &&
          // eslint-disable-next-line react-hooks/refs
          addCategoryPortalRef.current &&
          createPortal(
            <div className="mt-1 ml-7 p-1">
              <AddCategory
                parentCategoryId={category.id}
                onSuccess={() => setShowAddForm(false)}
                cancel={() => setShowAddForm(false)}
              />
            </div>,
            // eslint-disable-next-line react-hooks/refs
            addCategoryPortalRef.current,
          )}
      </DragableItem>
    </Droppable>
  );
}

export function CategoryTreeSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-8 w-full" />
      ))}
    </div>
  );
}

export function CategoryTreeEmptyState() {
  return (
    <div className="flex flex-col gap-2">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconFolderX />
          </EmptyMedia>
          <EmptyTitle>No categories found</EmptyTitle>
          <EmptyDescription>
            Get started by adding your first category.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
