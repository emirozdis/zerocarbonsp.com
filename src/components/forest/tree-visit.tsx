"use client";
import { studentDisplayName } from "@/lib/forest/student-label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Plant } from "@/lib/forest/model";
import { World } from "./world";
import { GrowthProgress } from "./growth-progress";
import { PlantStats, Vitality } from "./stats";
export function TreeVisit({
  plant,
  onClose,
}: {
  plant?: Plant | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={!!plant}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="tree-visit sm:max-w-xl">
        <DialogTitle>{plant ? studentDisplayName(plant.name) : undefined}’in ağacı</DialogTitle>
        <DialogDescription className="sr-only">
          Ağacın görünümü, boyu, genişliği ve canlılığı.
        </DialogDescription>
        {plant && (
          <>
            <World plants={[plant]} focus={plant} health={plant.health} />
            <GrowthProgress growth={plant.growth} /><PlantStats plant={plant} />
            <Vitality health={plant.health} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
