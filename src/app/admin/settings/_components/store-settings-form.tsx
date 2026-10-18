"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandWhatsapp,
  IconBrandX,
  IconBrandYoutube,
} from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowUpRightIcon,
  CheckIcon,
  DatabaseIcon,
  Undo2Icon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Spinner } from "~/components/spinner";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "~/components/ui/input-group";
import { Skeleton } from "~/components/ui/skeleton";
import {
  socialHosts,
  toWhatsAppLink,
  updateStoreSettingsInputSchema,
  whatsappNumberSchema,
  type SocialField,
  type UpdateStoreSettingsFormValues,
  type UpdateStoreSettingsInput,
} from "~/lib/schemas/entities/store-settings";
import { type RouterOutput, useTRPC } from "~/trpc/client";

type Settings = RouterOutput["admin"]["settings"]["queries"]["get"];

const socialFields: {
  name: SocialField;
  icon: typeof IconBrandInstagram;
  placeholder: string;
}[] = [
  {
    name: "instagramUrl",
    icon: IconBrandInstagram,
    placeholder: "instagram.com/gearverse",
  },
  {
    name: "facebookUrl",
    icon: IconBrandFacebook,
    placeholder: "facebook.com/gearverse",
  },
  {
    name: "tiktokUrl",
    icon: IconBrandTiktok,
    placeholder: "tiktok.com/@gearverse",
  },
  {
    name: "discordUrl",
    icon: IconBrandDiscord,
    placeholder: "discord.gg/gearverse",
  },
  { name: "xUrl", icon: IconBrandX, placeholder: "x.com/gearverse" },
  {
    name: "youtubeUrl",
    icon: IconBrandYoutube,
    placeholder: "youtube.com/@gearverse",
  },
];

/** Saved values as the inputs hold them: empty strings for nothing set. */
function toFormValues(settings: Settings): UpdateStoreSettingsFormValues {
  return {
    whatsappNumber: settings.whatsappNumber ?? "",
    instagramUrl: settings.instagramUrl ?? "",
    facebookUrl: settings.facebookUrl ?? "",
    tiktokUrl: settings.tiktokUrl ?? "",
    discordUrl: settings.discordUrl ?? "",
    xUrl: settings.xUrl ?? "",
    youtubeUrl: settings.youtubeUrl ?? "",
    lowStockThreshold: settings.lowStockThreshold,
  };
}

export function StoreSettingsForm({ settings }: { settings: Settings }) {
  const trpc = useTRPC();
  const form = useForm<
    UpdateStoreSettingsFormValues,
    unknown,
    UpdateStoreSettingsInput
  >({
    resolver: zodResolver(updateStoreSettingsInputSchema),
    defaultValues: toFormValues(settings),
  });

  const { mutate: save, isPending } = useMutation(
    trpc.admin.settings.mutations.update.mutationOptions({
      onSuccess: (saved) => {
        // Back to clean, showing the values as stored (e.g. 010… as +2010…).
        form.reset(toFormValues(saved));
        toast.success("Store settings saved");
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't save the store settings");
      },
    }),
  );

  const { isDirty } = form.formState;

  return (
    <Form {...form}>
      <form
        id="store-settings-form"
        // zod gives the messages, and a link may be typed without https://.
        noValidate
        onSubmit={form.handleSubmit((values) => save(values))}
        className="flex flex-col gap-10"
      >
        {!settings.ready && (
          <Alert>
            <DatabaseIcon />
            <AlertTitle>Settings can&apos;t be saved yet</AlertTitle>
            <AlertDescription>
              The store_settings table hasn&apos;t been created in the database.
              Until it is, the store uses these defaults.
            </AlertDescription>
          </Alert>
        )}

        <Section title="Contact" description="How customers reach the store.">
          <WhatsAppField />
        </Section>

        <Section
          title="Social links"
          description="Profiles linked from the store. Leave a field empty to hide it."
        >
          <div className="grid gap-x-4 gap-y-5 lg:grid-cols-2">
            {socialFields.map((social) => (
              <FormField
                key={social.name}
                control={form.control}
                name={social.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{socialHosts[social.name].label}</FormLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <social.icon aria-hidden stroke={1.75} />
                      </InputGroupAddon>
                      <FormControl>
                        <InputGroupInput
                          // FormControl would otherwise relabel it, and the group styles its focus by this slot.
                          data-slot="input-group-control"
                          {...field}
                          value={field.value ?? ""}
                          inputMode="url"
                          autoComplete="off"
                          spellCheck={false}
                          placeholder={social.placeholder}
                          className="focus-visible:outline-none"
                        />
                      </FormControl>
                    </InputGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </Section>

        <Section
          title="Inventory"
          description="Stock levels that need your attention."
        >
          <FormField
            control={form.control}
            name="lowStockThreshold"
            render={({ field }) => (
              <FormItem className="max-w-xs">
                <FormLabel>Low-stock threshold</FormLabel>
                <InputGroup>
                  <FormControl>
                    <InputGroupInput
                      // FormControl would otherwise relabel it, and the group styles its focus by this slot.
                      data-slot="input-group-control"
                      {...field}
                      value={Number.isNaN(field.value) ? "" : field.value}
                      onChange={(event) =>
                        field.onChange(event.target.valueAsNumber)
                      }
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={999}
                      step={1}
                      className="tabular-nums focus-visible:outline-none"
                    />
                  </FormControl>
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>units or fewer</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FormDescription>
                  Used by the dashboard&apos;s low-stock list.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <SaveBar
          visible={isDirty || isPending}
          saving={isPending}
          canSave={settings.ready}
          onDiscard={() => form.reset()}
        />
      </form>
    </Form>
  );
}

function WhatsAppField() {
  const value = useWatch<UpdateStoreSettingsFormValues, "whatsappNumber">({
    name: "whatsappNumber",
  });
  const parsed = whatsappNumberSchema.safeParse(value);
  const link =
    parsed.success && parsed.data ? toWhatsAppLink(parsed.data) : null;

  return (
    <FormField<UpdateStoreSettingsFormValues, "whatsappNumber">
      name="whatsappNumber"
      render={({ field }) => (
        <FormItem className="max-w-md">
          <FormLabel>WhatsApp number</FormLabel>
          <InputGroup>
            <InputGroupAddon>
              <IconBrandWhatsapp aria-hidden stroke={1.75} />
            </InputGroupAddon>
            <FormControl>
              <InputGroupInput
                // FormControl would otherwise relabel it, and the group styles its focus by this slot.
                data-slot="input-group-control"
                {...field}
                value={field.value ?? ""}
                type="tel"
                inputMode="tel"
                autoComplete="off"
                placeholder="+20 101 234 5678"
                className="tabular-nums focus-visible:outline-none"
              />
            </FormControl>
          </InputGroup>
          <FormDescription>
            The main contact shown across the store. Egyptian mobiles can start
            with 01.
          </FormDescription>
          <FormMessage />
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 text-sm tabular-nums underline-offset-4 hover:underline"
            >
              Chats open at {link.replace("https://", "")}
              <ArrowUpRightIcon className="size-3.5" aria-hidden />
            </a>
          )}
        </FormItem>
      )}
    />
  );
}

/** A settings group: its heading on the left, its fields in a card on the right. */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-x-10 gap-y-4 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
      <div className="flex flex-col gap-1 md:pt-6">
        <h2 className="text-base font-medium">{title}</h2>
        <p className="text-muted-foreground text-sm text-pretty">
          {description}
        </p>
      </div>
      <Card>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
}

/**
 * Pinned to the bottom of the page while there are unsaved changes, so saving
 * is always one click away and a clean form has nothing to save.
 */
function SaveBar({
  visible,
  saving,
  canSave,
  onDiscard,
}: {
  visible: boolean;
  saving: boolean;
  canSave: boolean;
  onDiscard: () => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="sticky bottom-4 z-20 flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div
            role="region"
            aria-label="Unsaved changes"
            // The buttons would inherit the bar's elevation variable; they stay flat.
            className="surface-control surface-floating flex w-full max-w-xl items-center gap-3 rounded-full py-2 pr-2 pl-5 [--surface-shadow:var(--shadow-lg)] [&_[data-slot]]:[--surface-shadow:none]"
          >
            <p className="flex-1 text-sm font-medium">Unsaved changes</p>
            <Button
              type="button"
              variant="outline"
              onClick={onDiscard}
              disabled={saving}
            >
              <Undo2Icon />
              Discard
            </Button>
            <Button
              type="submit"
              form="store-settings-form"
              disabled={saving || !canSave}
            >
              {saving ? <Spinner /> : <CheckIcon />}
              Save
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function StoreSettingsFormSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      {[1, 6, 1].map((fields, index) => (
        <div
          key={index}
          className="grid gap-x-10 gap-y-4 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]"
        >
          <div className="flex flex-col gap-2 md:pt-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Card>
            <CardContent className="grid gap-5 lg:grid-cols-2">
              {Array.from({ length: fields }, (_, field) => (
                <div key={field} className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-9 w-full rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
