import { ArrowRightIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { getCategorySeoConfig } from "~/lib/seo/category-content";

export async function CategorySeoSection({ slug }: { slug: string }) {
  const config = getCategorySeoConfig(slug);
  if (!config) return null;

  const t = await getTranslations("guides");
  const base = `categorySeo.categories.${config.slug}` as const;

  return (
    <section
      aria-labelledby="category-guide-heading"
      className="mt-16 space-y-12 border-t pt-12 md:mt-20 md:pt-16"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
        <div className="space-y-4">
          <h2
            id="category-guide-heading"
            className="text-headline-sm text-balance"
          >
            {t(`${base}.guideHeading`)}
          </h2>
          <p className="text-muted-foreground text-body-lg text-pretty">
            {t(`${base}.guideBody1`)}
          </p>
          <p className="text-muted-foreground text-pretty">
            {t(`${base}.guideBody2`)}
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">
              {t("categorySeo.relatedCategoriesHeading")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {config.relatedCategories.map((item) => (
                <Link
                  key={item.slug}
                  href={`/categories/${item.slug}`}
                  className="surface-control focus-visible:outline-focus inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-[scale,background-color] duration-150 ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:active:scale-[0.97]"
                >
                  {t(`categorySeo.categoryLabels.${item.labelKey}`)}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">
              {t("categorySeo.guidesHeading")}
            </h3>
            <ul className="space-y-2.5">
              {config.guideSlugs.map((guideSlug) => (
                <li key={guideSlug}>
                  <Link
                    href={`/guides/${guideSlug}`}
                    className="group text-foreground hover:text-primary focus-visible:outline-focus inline-flex items-center gap-2 text-sm font-medium transition-[color] duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span className="underline decoration-from-font underline-offset-4">
                      {t(`articles.${guideSlug}.title`)}
                    </span>
                    <ArrowRightIcon
                      className="size-3.5 shrink-0 transition-[translate] duration-150 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-8 border-t pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16">
        <h3 className="text-title text-balance">
          {t("categorySeo.faqHeading")}
        </h3>
        <Accordion defaultValue={["faq-1"]}>
          {config.faqKeys.map((faqKey, index) => (
            <AccordionItem key={faqKey} value={`faq-${index + 1}`}>
              <AccordionTrigger>
                {t(`${base}.faqs.${faqKey}.question` as never)}
              </AccordionTrigger>
              <AccordionContent>
                <p>{t(`${base}.faqs.${faqKey}.answer` as never)}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
