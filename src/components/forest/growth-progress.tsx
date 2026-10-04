import { Sprout } from "lucide-react";
import { growthStage } from "@/lib/forest/growth-profile";

export function GrowthProgress({ growth }: { growth: number }) {
  const stage = growthStage(growth);
  const next = growth < 60 ? stage.next : undefined;
  return <div className="plant-growth-progress">
    <Sprout size={18} />
    <div><strong>{stage.label}</strong><span>{next ? `Sıradaki adım: ${next.label}` : "Sıfır israf: en büyük ağaç."}</span></div>
    {next && <progress aria-label={`${next.label} aşamasına ilerleme`} max={1} value={stage.progress} />}
  </div>;
}
