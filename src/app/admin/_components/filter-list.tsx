import { ChevronRightIcon, XIcon } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "~/components/ui/button";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Skeleton } from "~/components/ui/skeleton";
import { useFlatCategories } from "~/hooks/use-flat-categories";
import { iconsMap } from "~/lib/icons-map";
import type { RouterOutputs } from "~/trpc/react";
import { OrderStatus } from "./tables/orders/order-status";
import { PaymentMethod } from "~/app/(user)/(protected)/_components/payment-method";

const itemVariant = {
  hidden: { y: 10, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

const listVariant = {
  hidden: { y: 10, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.05,
      staggerChildren: 0.06,
    },
  },
};

export type FilterKey = "brands" | "categories" | "status" | "paymentMethod";
type FilterValue = {
  brands: number[];
  categories: number[];
  status: "PENDING" | "SHIPPED" | "DELIVERED" | "REFUNDED" | "CANCELLED";
  paymentMethod: "COD";
};
type FilterItemsValue = {
  brands: number;
  categories: number;
  status: "PENDING" | "SHIPPED" | "DELIVERED" | "REFUNDED" | "CANCELLED";
  paymentMethod: "COD";
};
type FilterValueProp = {
  key: FilterKey;
  value: FilterValue[FilterKey] | null;
};

interface FilterListProps {
  filters: FilterValueProp[];
  loading: boolean;
  brands?: RouterOutputs["admin"]["brands"]["getPage"]["data"];
  categories?: RouterOutputs["admin"]["categories"]["findAll"];
  onRemove: ({
    key,
    value,
  }: {
    key: FilterKey;
    value: FilterItemsValue[FilterKey] | null;
  }) => void;
}

export function FilterList({
  brands,
  categories,
  filters,
  loading = false,
  onRemove,
}: FilterListProps) {
  const flattenedCategories = useFlatCategories(categories ?? []);

  function renderFilter({
    key,
    value,
  }: {
    key: FilterKey;
    value: FilterItemsValue[FilterKey] | null;
  }) {
    switch (key) {
      case "brands":
        const brand = brands?.find((brand) => brand.id === value);

        return (
          <div className="flex items-center gap-2">
            <div className="size-6 overflow-hidden rounded-sm border">
              <ImageWithFallback
                src={brand?.logoUrl}
                alt={brand?.name ?? `Brand name ${value}`}
                width={20}
                height={20}
                className="size-full object-cover"
              />
            </div>

            <p>{brand?.name ?? `Brand name ${value}`}</p>
          </div>
        );

      case "categories":
        const category = flattenedCategories.find(
          (category) => category.id === value,
        );

        return (
          <div className="flex items-center justify-start">
            {category?.path.map((p, idx) => {
              const Icon = iconsMap.get(p.icon);

              return (
                <div
                  key={`${p.name}-${idx}`}
                  className="flex items-center justify-start"
                >
                  {Icon && <Icon className="mr-1 size-4" />}
                  <span>{p.name}</span>
                  {idx != category?.path.length - 1 && (
                    <ChevronRightIcon className="opacity-50" />
                  )}
                </div>
              );
            })}
          </div>
        );

      case "status":
        return (
          <OrderStatus
            variant="plain"
            status={
              value as
                | "PENDING"
                | "SHIPPED"
                | "DELIVERED"
                | "REFUNDED"
                | "CANCELLED"
            }
          />
        );

      case "paymentMethod":
        return <PaymentMethod paymentMethod={value as "COD"} />;
    }
  }

  return (
    <motion.ul
      variants={listVariant}
      initial="hidden"
      animate="show"
      className="flex space-x-2"
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <motion.li key="1" variants={itemVariant}>
            <Skeleton className="h-8 w-[100px]" />
          </motion.li>
          <motion.li key="2" variants={itemVariant}>
            <Skeleton className="h-8 w-[100px]" />
          </motion.li>
        </div>
      ) : (
        filters.map(({ key, value }) =>
          Array.isArray(value)
            ? value?.map((value) => (
                <motion.li key={`${key}-${value}`} variants={itemVariant}>
                  <Button
                    variant="outline"
                    className="group cursor-pointer has-[>svg]:px-0 has-[>svg]:pr-4 has-[>svg]:pl-0"
                    onClick={() => onRemove({ key, value })}
                  >
                    <XIcon className="ml-0 size-0 scale-0 transition-all group-hover:ml-2 group-hover:size-4 group-hover:scale-100" />

                    {renderFilter({ key, value })}
                  </Button>
                </motion.li>
              ))
            : value && (
                <motion.li key={`${key}-${value}`} variants={itemVariant}>
                  <Button
                    variant="outline"
                    className="group cursor-pointer has-[>svg]:px-0 has-[>svg]:pr-4 has-[>svg]:pl-0"
                    onClick={() => onRemove({ key, value })}
                  >
                    <XIcon className="ml-0 size-0 scale-0 transition-all group-hover:ml-2 group-hover:size-4 group-hover:scale-100" />

                    {renderFilter({ key, value })}
                  </Button>
                </motion.li>
              ),
        )
      )}
    </motion.ul>
  );
}
