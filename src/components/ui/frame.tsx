import * as React from "react";

import { cn } from "~/lib/utils";

function Frame({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="frame"
      className={cn(
        "bg-muted relative flex flex-col gap-3 rounded-2xl p-1",
        className,
      )}
      {...props}
    />
  );
}

function FramePanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="frame-panel"
      className={cn(
        "not-has-[table]:bg-card space-y-4 overflow-hidden bg-clip-padding not-has-[table]:rounded-xl not-has-[table]:border not-has-[table]:p-5",
        className,
      )}
      {...props}
    />
  );
}

function FrameHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="frame-panel-header"
      className={cn("flex flex-col gap-2 px-5 py-4", className)}
      {...props}
    />
  );
}

function FrameTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="frame-panel-title"
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  );
}

function FrameDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="frame-panel-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function FrameFooter({ className, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      data-slot="frame-panel-footer"
      className={cn("flex flex-col gap-1 px-5 py-4", className)}
      {...props}
    />
  );
}

export {
  Frame,
  FramePanel,
  FrameHeader,
  FrameTitle,
  FrameDescription,
  FrameFooter,
};
