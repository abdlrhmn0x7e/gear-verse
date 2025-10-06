"use client";

import { SearchIcon } from "lucide-react";
import { Button } from "~/components/ui/button";

import { Kbd, KbdGroup } from "~/components/ui/kbd";

export function ProductSearchDialog() {
  return (
    <Button variant="outline" className="relative w-full justify-start">
      <SearchIcon />
      Search Products
      <KbdGroup className="absolute top-1/2 right-3 -translate-y-1/2">
        <Kbd>⌘ + K</Kbd>
      </KbdGroup>
    </Button>
  );
}
