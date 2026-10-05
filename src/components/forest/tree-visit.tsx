"use client";
import { studentDisplayName } from "@/lib/forest/student-label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Plant } from "@/lib/forest/model";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { World } from "./world";
import { GrowthProgress } from "./growth-progress";
import { PlantStats, Vitality } from "./stats";
import {
  EnvironmentalImpactSummary,
  type EnvironmentalImpact,
} from "./environmental-impact-summary";
export function TreeVisit({
  plant,
  impact,
  onClose,
}: {
  plant?: Plant | null;
  impact?: EnvironmentalImpact;
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
          Ağacın görünümü, boyu, genişliği, canlılığı ve çevresel etki özeti.
        </DialogDescription>
        {plant && (
          impact ? (
            <Tabs defaultValue="tree" className="tree-visit-tabs">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tree">Ağaç Önizlemesi</TabsTrigger>
                <TabsTrigger value="impact">Çevresel Etki Özeti</TabsTrigger>
              </TabsList>
              <TabsContent value="tree">
                <World plants={[plant]} focus={plant} health={plant.health} />
                <GrowthProgress growth={plant.growth} />
                <PlantStats plant={plant} />
                <Vitality health={plant.health} />
              </TabsContent>
              <TabsContent value="impact">
                <EnvironmentalImpactSummary impact={impact} />
              </TabsContent>
            </Tabs>
          ) : (
            <>
              <World plants={[plant]} focus={plant} health={plant.health} />
              <GrowthProgress growth={plant.growth} />
              <PlantStats plant={plant} />
              <Vitality health={plant.health} />
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
