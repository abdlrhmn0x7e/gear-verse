"use client";

import { type UniqueIdentifier } from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowRightIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import type { ForwardedRef } from "react";
import { useState } from "react";
import { toast } from "~/components/ui/toast";
import { LoadMore } from "~/components/load-more";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import type { CategoryTree } from "~/lib/schemas/entities/category";
import { useTRPC, type RouterOutput } from "~/trpc/client";
import { useCategoryStore } from "../_store/provider";
import { AddCategory } from "./add-category";
import { CategoryIcon } from "./category-tree";
import { EditCategory } from "./edit-category";
import { CategoryProductList } from "./products-grid";

type CategoryProduct =
  RouterOutput["admin"]["products"]["queries"]["getPage"]["data"][number];

/** The selected category: what it is, where it sits, and what is filed under it. */
export function CategoryDetails({
  category,
  parent,
  products,
  isLoadingProducts,
  hasNextPage,
  loadMoreRef,
  activeId,
}: {
  category: CategoryTree;
  parent: CategoryTree | undefined;
  products: CategoryProduct[] | undefined;
  isLoadingProducts: boolean;
  hasNextPage: boolean;
  loadMoreRef: ForwardedRef<HTMLDivElement>;
  activeId: UniqueIdentifier | null;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "add">("view");
  const setSelectedCategoryId = useCategoryStore(
    (state) => state.setSelectedCategoryId,
  );

  const children = category.children ?? [];
  const productCount = products
    ? `${products.length}${hasNextPage ? "+" : ""}`
    : undefined;

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <section className="flex flex-col gap-5" aria-label="Category details">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-muted text-foreground flex size-12 shrink-0 items-center justify-center rounded-2xl">
              <CategoryIcon icon={category.icon} className="size-6" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-medium tracking-tight">
                {category.name}
              </h2>
              <p className="text-muted-foreground truncate text-sm">
                {parent ? `Sub-category of ${parent.name}` : "Root category"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode("add")}
              disabled={mode === "add"}
            >
              <PlusIcon data-icon="inline-start" />
              Add sub-category
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode("edit")}
              disabled={mode === "edit"}
            >
              <PencilIcon data-icon="inline-start" />
              Edit
            </Button>
            <DeleteCategoryButton
              id={category.id}
              name={category.name}
              onDeleted={() => setSelectedCategoryId(parent?.id ?? null)}
            />
          </div>
        </div>

        {mode !== "view" && (
          <div className="bg-card max-w-md rounded-2xl p-4">
            <p className="mb-3 text-sm font-medium">
              {mode === "edit"
                ? "Edit category"
                : `New sub-category of ${category.name}`}
            </p>
            {mode === "edit" ? (
              <EditCategory
                key={category.id}
                id={category.id}
                defaultValues={{
                  icon: category.icon,
                  name: category.name,
                  parent_id: parent?.id,
                }}
                onSuccess={() => setMode("view")}
                cancel={() => setMode("view")}
              />
            ) : (
              <AddCategory
                parentCategoryId={category.id}
                onSuccess={() => setMode("view")}
                cancel={() => setMode("view")}
              />
            )}
          </div>
        )}

        <dl className="bg-card grid gap-x-8 gap-y-4 rounded-2xl p-5 text-sm sm:grid-cols-2 xl:grid-cols-4">
          <Detail label="Slug">
            <span className="font-mono text-xs">{category.slug}</span>
          </Detail>
          <Detail label="Icon">
            <span className="flex items-center gap-1.5 capitalize">
              <CategoryIcon
                icon={category.icon}
                className="text-muted-foreground size-4"
              />
              {category.icon.toLowerCase()}
            </span>
          </Detail>
          <Detail label="Parent">
            {parent ? (
              <button
                type="button"
                className="cursor-pointer underline-offset-4 hover:underline"
                onClick={() => setSelectedCategoryId(parent.id)}
              >
                {parent.name}
              </button>
            ) : (
              <span className="text-muted-foreground">None</span>
            )}
          </Detail>
          <Detail label="Created">
            {format(new Date(category.created_at), "d MMM yyyy")}
          </Detail>
          <Detail label="Products">
            {productCount ?? <Skeleton className="h-4 w-8" />}
          </Detail>
          <Detail
            label="Sub-categories"
            className="sm:col-span-1 xl:col-span-3"
          >
            {children.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {children.map((child) => (
                  <Badge
                    key={child.id}
                    variant="outline"
                    render={
                      <button
                        type="button"
                        className="cursor-pointer"
                        onClick={() => setSelectedCategoryId(child.id)}
                      />
                    }
                  >
                    {child.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground">None</span>
            )}
          </Detail>
        </dl>
      </section>

      <CategoryAttributes categoryId={category.id} parent={parent} />

      <section
        className="flex flex-col gap-4"
        aria-labelledby="category-products"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 id="category-products" className="text-base font-medium">
              Products
            </h3>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Drag a product onto a category in the tree to move it there.
            </p>
          </div>
        </div>

        <CategoryProductList
          activeId={activeId}
          products={products}
          isLoadingProducts={isLoadingProducts}
        />
        <LoadMore hasNextPage={hasNextPage} ref={loadMoreRef} />
      </section>
    </div>
  );
}

function Detail({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

/** Attributes hang off root categories; a sub-category shows its root's. */
function CategoryAttributes({
  categoryId,
  parent,
}: {
  categoryId: number;
  parent: CategoryTree | undefined;
}) {
  const trpc = useTRPC();
  const { data, isPending } = useQuery(
    trpc.admin.attributes.queries.getCategoryAttributes.queryOptions({
      categoryId,
    }),
  );

  const attributes = new Map<number, { name: string; values: string[] }>();
  for (const row of data ?? []) {
    const attribute = attributes.get(row.id) ?? { name: row.name, values: [] };
    attribute.values.push(row.value);
    attributes.set(row.id, attribute);
  }

  return (
    <section
      className="flex flex-col gap-4"
      aria-labelledby="category-attributes"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 id="category-attributes" className="text-base font-medium">
            Attributes
          </h3>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {parent
              ? "Inherited from the root category."
              : "Shared by this category and everything under it."}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/admin/attributes" />}
        >
          Manage attributes
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>

      {isPending ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-40 rounded-2xl" />
          ))}
        </div>
      ) : attributes.size === 0 ? (
        <p className="text-muted-foreground bg-card rounded-2xl px-5 py-4 text-sm">
          No attributes connected yet.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {[...attributes].map(([id, attribute]) => (
            <li key={id} className="bg-card rounded-2xl px-4 py-3">
              <p className="text-sm font-medium">{attribute.name}</p>
              <p className="text-muted-foreground mt-0.5 truncate text-xs">
                {attribute.values.join(", ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DeleteCategoryButton({
  id,
  name,
  onDeleted,
}: {
  id: number;
  name: string;
  onDeleted: () => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: deleteCategory, isPending } = useMutation(
    trpc.admin.categories.mutations.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.admin.categories.queries.findAll.queryFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.admin.categories.queries.findRoots.queryFilter(),
        );
        toast.success("Category deleted successfully");
        onDeleted();
      },
      onError: () => {
        toast.error(
          "This category has products, please remove/move them first",
        );
      },
    }),
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="destructive-outline"
            size="sm"
            disabled={isPending}
          />
        }
      >
        <Trash2Icon data-icon="inline-start" />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            A category that still has products can&apos;t be deleted; move them
            first. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <XIcon data-icon="inline-start" />
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => deleteCategory({ id })}
          >
            <Trash2Icon data-icon="inline-start" />
            Delete category
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
