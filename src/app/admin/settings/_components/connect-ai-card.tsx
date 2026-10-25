"use client";

import { IconCheck, IconCopy, IconLink } from "@tabler/icons-react";
import { useState } from "react";

import { Section } from "./store-settings-form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "~/components/ui/input-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { toast } from "~/components/ui/toast";
import { env } from "~/env";

const mcpUrl = `${env.NEXT_PUBLIC_APP_URL}/api/mcp`;

const steps = {
  chatgpt: [
    "In ChatGPT, open Settings → Security and login and turn on Developer mode.",
    "Add a new app and paste the URL.",
    "Sign in with your Google admin account when asked.",
  ],
  claude: [
    "In Claude, open Settings → Connectors.",
    "Choose “Add custom connector” and paste the URL.",
    "Sign in with your Google admin account when asked.",
  ],
};

export function ConnectAiCard() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(mcpUrl);
      setCopied(true);
      toast.success("Connection URL copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the URL. Select it and copy it instead.");
    }
  }

  return (
    <Section
      title="Connect ChatGPT or Claude"
      description="Add and edit products and stock from chat. New products are saved as drafts."
    >
      <div className="flex flex-col gap-5">
        <InputGroup className="max-w-md">
          <InputGroupAddon>
            <IconLink aria-hidden stroke={1.75} />
          </InputGroupAddon>
          <InputGroupInput
            readOnly
            value={mcpUrl}
            aria-label="Connection URL"
            onFocus={(event) => event.currentTarget.select()}
            className="focus-visible:outline-none"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton variant="outline" onClick={handleCopy}>
              {copied ? (
                <IconCheck data-icon="inline-start" />
              ) : (
                <IconCopy data-icon="inline-start" />
              )}
              {copied ? "Copied" : "Copy"}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>

        <Tabs defaultValue="chatgpt">
          <TabsList variant="line">
            <TabsTrigger value="chatgpt">ChatGPT</TabsTrigger>
            <TabsTrigger value="claude">Claude</TabsTrigger>
          </TabsList>
          {(["chatgpt", "claude"] as const).map((app) => (
            <TabsContent key={app} value={app}>
              <ol className="text-muted-foreground list-decimal space-y-1.5 ps-5 pt-2 text-pretty marker:tabular-nums">
                {steps[app].map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </TabsContent>
          ))}
        </Tabs>

        <p className="text-muted-foreground text-xs">
          Only admins can connect. Anyone else is refused at sign-in.
        </p>
      </div>
    </Section>
  );
}
