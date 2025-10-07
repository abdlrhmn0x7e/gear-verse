"use client";

import { ChevronRightIcon, SearchIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { useEffect, useState } from "react";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { DialogOverlay } from "~/components/ui/dialog";
import { Kbd, KbdGroup } from "~/components/ui/kbd";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { useDebounce } from "~/hooks/use-debounce";
import { iconsMap } from "~/lib/icons-map";
import { api, type RouterOutputs } from "~/trpc/react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { IconShoppingBagX } from "@tabler/icons-react";
import { Spinner } from "~/components/spinner";
import { keepPreviousData } from "@tanstack/react-query";
import { cn } from "~/lib/utils";

export function ProductSearchDialog({
  children,
  className,
  withOverlay = true,
  anchor = "sidebar",
}: {
  className?: string;
  children: React.ReactNode;
  withOverlay?: boolean;
  anchor?: "navbar" | "sidebar";
}) {
  const [open, setOpen] = useState(false);

  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [trigger, setTrigger] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);

    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="relative" ref={setTrigger}>
        <Dialog.Trigger asChild>
          <div
            className="group relative w-full cursor-text first:relative first:z-10 focus-visible:outline-none"
            data-state={open ? "open" : "closed"}
          >
            {children}

            <div
              className={cn(
                "bg-background group-data-[state=open]:animate-search-button-in group-data-[state=closed]:animate-search-button-out absolute inset-0 rounded-lg border bg-clip-padding",
                anchor === "navbar" ? "origin-left" : "origin-left",
              )}
            />
          </div>
        </Dialog.Trigger>

        <div
          ref={setContainer}
          className="peer pointer-events-none absolute -inset-0 has-[data-state=open]:pointer-events-auto"
        />
      </div>

      <Dialog.Portal container={container}>
        {withOverlay && <DialogOverlay />}

        <Dialog.Content className="group data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 relative z-50 flex w-fit flex-col gap-4 duration-200 focus-visible:outline-none">
          <Dialog.Title className="sr-only">Search Products</Dialog.Title>

          <div
            className={cn("h-[410px] rounded-lg", className)}
            style={{
              width: trigger?.clientWidth ? trigger.clientWidth * 2 : 400,
            }}
          >
            <Content close={() => setOpen(false)} />

            <div
              className={cn(
                "bg-background group-data-[state=open]:animate-search-dialog-in group-data-[state=closed]:animate-search-dialog-out absolute -inset-y-2 -right-2 left-0 origin-top-left rounded-lg border bg-clip-padding",
                anchor === "navbar" ? "origin-center" : "origin-top-left",
              )}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ProductSearchIcon({ className }: { className?: string }) {
  return (
    <SearchIcon
      className={cn(
        "transition-all duration-200 group-data-[state=open]:translate-x-[16px] group-data-[state=open]:opacity-0",
        className,
      )}
    />
  );
}

export function ProductSearchPlaceholder({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="truncate transition-transform duration-100 group-data-[state=open]:translate-x-[26px]">
      {children}
    </span>
  );
}

function Content({ close }: { close: () => void }) {
  const route = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [hover, setHover] = useState<number | null>(null);
  const { data, isPending, isFetching, isError } =
    api.public.products.queries.getPage.useQuery(
      {
        pageSize: 4,
        filters: {
          title: debouncedSearch,
        },
      },
      {
        placeholderData: keepPreviousData,
      },
    );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!data) return;

    const key = e.key;
    switch (key) {
      case "ArrowDown": {
        e.preventDefault();
        e.stopPropagation();
        setHover((hover) => {
          const next = (hover ?? 0) + 1;
          return next % (5 + 1);
        });
        break;
      }

      case "ArrowUp": {
        e.preventDefault();
        e.stopPropagation();
        setHover((hover) => {
          const prev = Math.abs((hover ?? 0) - 1);
          return prev % (5 + 1);
        });
        break;
      }

      case "Enter": {
        e.preventDefault();
        e.stopPropagation();

        if (hover && data.data[hover - 1]?.slug) {
          close();
          route.push(`/products/${data.data[hover - 1]?.slug}`);
        }
        break;
      }
    }
  }

  return (
    <div className="relative z-10 flex h-full flex-col gap-2 pl-2">
      <div className="relative z-10 flex w-full origin-top-left items-center gap-4 px-4 py-2">
        <SearchIcon className="size-[17px]" />

        <input
          type="text"
          placeholder="Search Products"
          className="w-full transition-all duration-200 group-data-[state=closed]:-translate-x-4 group-data-[state=open]:translate-x-0 focus-visible:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {isFetching ? (
          <Spinner />
        ) : (
          <KbdGroup className="absolute top-1/2 right-3 z-10 -translate-y-1/2 pt-1">
            <Kbd>Esc</Kbd>
          </KbdGroup>
        )}
      </div>

      <Separator />

      {isPending && (
        <ul className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <ProductItemSkeleton key={index} />
          ))}
        </ul>
      )}

      {isError && (
        <Empty className="gap-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconShoppingBagX />
            </EmptyMedia>
            <EmptyTitle>An Error Occurred</EmptyTitle>
            <EmptyDescription>
              An error occurred while fetching the products. Please try again
              later.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {data && data.data.length === 0 && (
        <Empty className="gap-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconShoppingBagX />
            </EmptyMedia>
          </EmptyHeader>
          <EmptyTitle>No products found</EmptyTitle>
          <EmptyDescription>
            Try adjusting your search or check back later.
          </EmptyDescription>
        </Empty>
      )}

      {data && data.data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {data.data.map((product, index) => (
            <ProductItem
              key={`${product.id}-${product.title}-${index}`}
              product={product}
              hover={hover}
              index={index}
              onClick={() => close()}
              onPointerOver={() => setHover(index + 1)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ProductItemSkeleton() {
  return (
    <li className="relative h-16 w-full">
      <Skeleton className="size-full" />
    </li>
  );
}

function ProductItem({
  product,
  hover,
  index,
  ...props
}: {
  product: RouterOutputs["public"]["products"]["queries"]["getPage"]["data"][number];
  hover: number | null;
  index: number;
} & React.ComponentProps<"li">) {
  return (
    <li {...props} className="relative">
      <Link
        href={`/products/${product.slug}`}
        className="relative z-10 flex items-center gap-2 rounded-md p-2"
      >
        <ImageWithFallback
          src={product.thumbnailUrl}
          alt={product.title}
          className="size-16 shrink-0 rounded-sm"
          width={40}
          height={40}
        />

        <div className="flex size-full flex-1 flex-col">
          <p className="text-primary-foreground text-sm font-medium">
            {product.title}
          </p>

          <p className="text-muted-foreground line-clamp-2 flex-1 overflow-hidden text-sm">
            {product.summary}
          </p>
        </div>
      </Link>

      {hover === index + 1 ? (
        <motion.div
          layoutId="hover"
          id="hover"
          transition={{
            duration: 0.1,
          }}
          className="bg-accent/50 absolute inset-0 rounded-md"
        />
      ) : null}
    </li>
  );
}
