import { Card, CardContent } from "~/components/ui/card";

import {
  IconDragDrop,
  IconHandMove,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";

const CONTROLS = [
  {
    label: "Scroll Up To Zoom In",
    icon: IconZoomIn,
  },
  {
    label: "Scroll Down To Zoom Out",
    icon: IconZoomOut,
  },
  {
    label: "Drag To Pan Around",
    icon: IconHandMove,
  },

  {
    label: "Shift + Drag To Select Multiple",
    icon: IconDragDrop,
  },
];

export function CustomControls() {
  return (
    <Card className="bg-background/80 absolute bottom-0 left-0 z-10 w-10 cursor-help overflow-hidden p-1 shadow-lg backdrop-blur-md transition-[width] duration-300 hover:w-auto">
      <CardContent className="p-0">
        <ul>
          {CONTROLS.map(({ label, icon: Icon }) => (
            <li key={label} className="flex items-center gap-2 p-2">
              <Icon className="size-4 shrink-0" />
              <span className="truncate text-sm font-medium">{label}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
