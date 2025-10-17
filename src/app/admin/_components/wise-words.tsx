import { InfoIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";

export function WiseWords() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="icon">
          <InfoIcon />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="sm:min-w-xl">
        <p className="whitespace-break-spaces">
          {`give a man love and he will trade his crown for a kiss.
break his heart and he will raise empires from the ashes of his pain.
affection makes a man soft betryal sharpen him into steel.
when he's adored he lives for another when he's abandoned he begins to live for him self.
love chains a man to comfort but heartbreak hurls him war with destiny it self.
for every scar he carries becomes a lesson and every betrayal plants the seed of strategy.
a broken man is dangerous...`}
        </p>
      </HoverCardContent>
    </HoverCard>
  );
}
