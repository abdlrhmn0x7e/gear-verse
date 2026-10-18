/** The surface every node on the canvas sits on: the card fill with a hairline. */
export const nodeSurface =
  "bg-card text-card-foreground rounded-xl shadow-xs ring-1 ring-black/8 dark:ring-white/8";

/**
 * Connectors on a node's edge: small and quiet until the node is hovered or a
 * connection is being dragged to or from them.
 */
export const nodeHandle =
  "size-2.5! min-h-0! min-w-0! border-[1.5px]! border-foreground/25! bg-card! transition-colors group-hover:border-primary! group-hover:bg-primary! [&.connectingfrom]:border-primary! [&.connectingfrom]:bg-primary! [&.connectingto]:border-primary! [&.connectingto]:bg-primary!";
