import { cacheTag } from "next/cache";
import { Heading } from "~/components/heading";
import { api } from "~/trpc/server";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { IconFilterCancel } from "@tabler/icons-react";
import { FilterItem } from "./filter-item";
import { RadioGroup } from "~/components/ui/radio-group";

export async function Filters({ slug }: { slug: string }) {
  "use cache";

  const attributes = await api.public.categories.queries.getAttributes({
    slug,
  });

  cacheTag("attribute-filters", slug);

  if (attributes.length === 0) {
    return <FiltersEmptyState />;
  }

  return (
    <div className="flex flex-col gap-6 divide-y [&>*:not(:last-child)]:pb-8">
      {attributes.length > 0 &&
        attributes.map((att) => {
          const WrapperElement = att.type === "SELECT" ? RadioGroup : "div";

          return (
            <WrapperElement
              key={`attribute-${att.name}`}
              className="flex flex-col gap-4 p-1"
            >
              {att.type !== "BOOLEAN" ? (
                <>
                  <Heading level={4}>{att.name}</Heading>
                  {att.values.map((val) => (
                    <FilterItem
                      key={`${att.name}-${val.value}`}
                      label={val.value}
                      keyName={att.slug ?? "unknown-key"}
                      type={att.type ?? "MULTISELECT"}
                      value={val.slug}
                    />
                  ))}
                </>
              ) : (
                <FilterItem
                  key={`${att.name}-switch`}
                  label={att.name ?? "Unknown Attribute"}
                  keyName={att.slug ?? "unknown-key"}
                  type={att.type ?? "MULTISELECT"}
                />
              )}
            </WrapperElement>
          );
        })}
    </div>
  );
}

function FiltersEmptyState() {
  return (
    <Empty className="gap-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconFilterCancel />
        </EmptyMedia>
        <EmptyTitle>No filters found</EmptyTitle>
        <EmptyDescription>
          We couldn&apos;t find any filters to display at the moment. Please
          check back later!
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
