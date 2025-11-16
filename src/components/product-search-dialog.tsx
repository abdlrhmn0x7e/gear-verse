"use client";

import { IconShoppingBagX } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { useEffect, useState } from "react";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Spinner } from "~/components/spinner";
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
        <Dialog.Trigger asChild>
          <div
            className="group relative w-full cursor-text first:relative first:z-10 focus-visible:outline-none"
            data-state={open ? "open" : "closed"}
          >
            {children}

            <div
              className={cn(
                "bg-background absolute inset-0 rounded-lg border bg-clip-padding",
                shouldAnimate &&
                  "group-data-[state=open]:animate-search-button-in group-data-[state=closed]:animate-search-button-out",
              )}
            />
          </div>
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

        <Dialog.Content
          className={cn(
            "group relative z-50 flex w-fit flex-col gap-4 duration-100 focus-visible:outline-none",
            shouldAnimate &&
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        >
          <Dialog.Title className="sr-only">Search Products</Dialog.Title>

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
                "bg-background absolute -inset-y-2 -right-2 left-0 origin-top-left rounded-lg border bg-clip-padding",
                shouldAnimate &&
                  "group-data-[state=open]:animate-search-dialog-in group-data-[state=closed]:animate-search-dialog-out",
                "origin-top-left",
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
        <SearchIcon className="group-data-[state=closed]:animate-search-icon-out group-data-[state=open]:animate-search-icon-in size-[17px] transition-transform" />

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

      {isPending && <ProductSearchLoading />}

      {isError && <ProductSearchError />}

      {data?.data.length === 0 && <ProductSearchEmpty />}

      {data && data.data.length > 0 && (
        <ul className="flex flex-col gap-1">
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
        <EmptyTitle>An Error Occurred</EmptyTitle>
        <EmptyDescription>
          An error occurred while fetching the products. Please try again later.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function ProductSearchEmpty() {
  return (
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
        className="relative z-10 flex items-center gap-2 rounded-md p-1"
      >
        <ImageWithFallback
          src={product.thumbnailUrl}
          alt={product.title}
          className="size-16 shrink-0 rounded-sm"
          width={128}
          height={128}
        />

        <div className="flex size-full flex-1 flex-col">
          <p className="text-foreground dark:text-primary-foreground text-sm font-medium">
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
