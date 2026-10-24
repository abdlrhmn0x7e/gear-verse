"use client";

import { IconBrandWhatsapp, IconShoppingBagX } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { useEffect, useState } from "react";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { DialogOverlay } from "~/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Kbd, KbdGroup } from "~/components/ui/kbd";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { useDebounce } from "~/hooks/use-debounce";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";
import { formatCurrency } from "~/lib/utils/format-currency";
import { type RouterOutput, useTRPC } from "~/trpc/client";

export function ProductSearchDialog({
  children,
  className,
  dialogClassName,
  withOverlay = true,
}: {
  className?: string;
  dialogClassName?: string;
  children: React.ReactNode;
  withOverlay?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [trigger, setTrigger] = useState<HTMLDivElement | null>(null);

  const isMobile = useIsMobile();

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
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        setShouldAnimate(true);
      }}
    >
      <div className="relative" ref={setTrigger}>
        <Dialog.Trigger
          type="button"
          aria-keyshortcuts="Control+K"
          className="group focus-visible:outline-focus relative flex w-full cursor-text rounded-full text-start first:relative first:z-10 focus-visible:outline-2 focus-visible:outline-offset-2"
          data-state={open ? "open" : "closed"}
        >
          {children}

          <span
            className={cn(
              "surface-control surface-field absolute inset-0 rounded-full",
              shouldAnimate &&
                "group-data-[state=open]:animate-search-button-in group-data-[state=closed]:animate-search-button-out",
            )}
          />
        </Dialog.Trigger>

        <div
          ref={setContainer}
          className={cn(
            "peer pointer-events-none absolute -inset-x-5 inset-y-0 has-[data-state=open]:pointer-events-auto",
            dialogClassName,
          )}
        />
      </div>

      <Dialog.Portal container={container}>
        {withOverlay && <DialogOverlay />}

        <Dialog.Popup
          data-state={open ? "open" : "closed"}
          className={cn(
            "group relative z-50 flex w-fit flex-col gap-4 duration-100 focus-visible:outline-none",
            shouldAnimate &&
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        >
          <Dialog.Title className="sr-only">Search products</Dialog.Title>

          <div
            className={cn("h-[350px] rounded-lg", className)}
            style={{
              width: trigger?.clientWidth
                ? isMobile
                  ? trigger.clientWidth * 1.25
                  : trigger.clientWidth < 300
                    ? 500
                    : trigger.clientWidth * 2
                : 400,
            }}
          >
            <Content close={() => setOpen(false)} />

            <div
              className={cn(
                "surface-control surface-floating absolute -inset-y-2 -end-2 start-0 origin-top-left rounded-[24px] [--surface-shadow:var(--shadow-xl)]",
                shouldAnimate &&
                  "group-data-[state=open]:animate-search-dialog-in group-data-[state=closed]:animate-search-dialog-out",
                "origin-top-left",
              )}
            />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ProductSearchIcon({ className }: { className?: string }) {
  return (
    <SearchIcon
      className={cn(
        "transition-all duration-200 group-data-[state=open]:-translate-x-2 group-data-[state=open]:opacity-0",
        className,
      )}
    />
  );
}

export function ProductSearchPlaceholder({
  children,
  className,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn("text-muted-foreground truncate duration-100", className)}
    >
      {children}
    </span>
  );
}

function Content({ close }: { close: () => void }) {
  const trpc = useTRPC();
  const route = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [hover, setHover] = useState<number | null>(null);
  const { data, isPending, isFetching, isError } = useQuery(
    trpc.public.products.queries.getPage.queryOptions(
      {
        pageSize: 4,
        filters: {
          title: debouncedSearch,
        },
      },
      {
        placeholderData: keepPreviousData,
      },
    ),
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const key = e.key;
    switch (key) {
      case "ArrowDown": {
        if (!data) return;
        e.preventDefault();
        e.stopPropagation();
        setHover((hover) => {
          const next = (hover ?? 0) + 1;
          return next % (5 + 1);
        });
        break;
      }

      case "ArrowUp": {
        if (!data) return;
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

        const highlighted = hover ? data?.data[hover - 1] : undefined;
        if (highlighted?.slug) {
          close();
          route.push(`/products/${highlighted.slug}`);
          break;
        }

        // nothing highlighted: Enter means "show me everything that matches"
        const query = search.trim();
        if (query) {
          close();
          route.push(`/products?title=${encodeURIComponent(query)}`);
        }
        break;
      }
    }
  }

  return (
    <div className="relative z-10 flex h-full flex-col gap-2 ps-2">
      <div className="relative z-10 flex w-full origin-top-left items-center gap-4 px-4 py-2">
        <SearchIcon className="group-data-[state=closed]:animate-search-icon-out group-data-[state=open]:animate-search-icon-in size-[17px] transition-transform" />

        <input
          type="search"
          enterKeyHint="search"
          aria-label="Search products"
          placeholder="Search products"
          className="w-full transition-all duration-200 group-data-[state=closed]:-translate-x-4 group-data-[state=open]:translate-x-0 focus-visible:outline-none [&::-webkit-search-cancel-button]:appearance-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {isFetching ? (
          <Spinner />
        ) : (
          <KbdGroup className="absolute top-1/2 end-3 z-10 -translate-y-1/2 pt-1">
            <Kbd>Esc</Kbd>
          </KbdGroup>
        )}
      </div>

      <Separator />

      {isPending && <ProductSearchLoading />}

      {isError && <ProductSearchError />}

      {data?.data.length === 0 && (
        <ProductSearchEmpty query={debouncedSearch} />
      )}

      {data && data.data.length > 0 && (
        <ul className="scroll-fade flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {data.data.map((product, index) => (
            <ProductSearchItem
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

export function ProductSearchLoading() {
  return (
    <ul className="flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <ProductItemSkeleton key={index} />
      ))}
    </ul>
  );
}

export function ProductSearchError() {
  return (
    <Empty className="gap-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconShoppingBagX />
        </EmptyMedia>
        <EmptyTitle>Unable to load products</EmptyTitle>
        <EmptyDescription>
          Check your connection and search again.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

/** No match still ends in a way forward: request what was searched for on WhatsApp. */
export function ProductSearchEmpty({ query }: { query: string }) {
  const item = query.trim();

  return (
    <Empty className="gap-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconShoppingBagX />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>Not on the shelf</EmptyTitle>
      <EmptyDescription>We can still get it for you.</EmptyDescription>
      <Button
        variant="outline"
        className="mt-6 max-w-full"
        nativeButton={false}
        render={
          <a
            href={`/request?item=${encodeURIComponent(item)}`}
            target="_blank"
            rel="noopener"
          />
        }
      >
        <IconBrandWhatsapp data-icon="inline-start" stroke={1.75} />
        <span className="truncate">Request &ldquo;{item}&rdquo;</span>
      </Button>
    </Empty>
  );
}

export function ProductItemSkeleton() {
  return (
    <li className="relative h-16 w-full">
      <Skeleton className="size-full" />
    </li>
  );
}

export function ProductSearchItem({
  product,
  hover,
  index,
  ...props
}: {
  product: RouterOutput["public"]["products"]["queries"]["getPage"]["data"][number];
  hover: number | null;
  index: number;
} & React.ComponentProps<"li">) {
  return (
    <li {...props} className="relative">
      <Link
        href={`/products/${product.slug}`}
        className="relative z-10 flex items-center gap-3 rounded-xl p-1"
      >
        <div className="image-well outline-image-outline size-16 shrink-0 overflow-hidden rounded-lg outline-1 -outline-offset-1">
          <ImageWithFallback
            src={product.thumbnailUrl}
            alt={product.title}
            className="size-full rounded-none border-none bg-transparent object-contain"
            width={128}
            height={128}
          />
        </div>

        <div className="flex size-full min-w-0 flex-1 flex-col">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-foreground text-sm font-medium">
              {product.title}
            </p>
            <p className="shrink-0 text-sm font-medium tabular-nums">
              {formatCurrency(product.price)}
            </p>
          </div>

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
          className="bg-accent absolute inset-0 rounded-xl"
        />
      ) : null}
    </li>
  );
}
