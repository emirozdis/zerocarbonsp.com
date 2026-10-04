import type { ReactNode } from "react";
import {
  Heart,
  MoveVertical,
  MoveHorizontal,
  CalendarDays,
  Wind,
  Droplets,
  Leaf,
} from "lucide-react";
import type { Plant } from "@/lib/forest/model";

export const formatNumber = (value: number, digits = 1) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: digits }).format(
    value,
  );

export function Metric({
  icon,
  label,
  value,
  unit,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="impact-stat">
      <span className="impact-stat-icon">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>
          {formatNumber(value)} <small>{unit}</small>
        </strong>
      </div>
    </div>
  );
}

export function ImpactStats({
  co2,
  water,
  food,
  floating = false,
}: {
  co2: number;
  water: number;
  food: number;
  floating?: boolean;
}) {
  return (
    <div className={`impact-stats ${floating ? "impact-stats-floating" : ""}`}>
      <Metric
        icon={<Wind size={19} />}
        label="Karbon tasarrufu"
        value={co2}
        unit="kg CO₂"
      />
      <Metric
        icon={<Droplets size={19} />}
        label="Su ayak izi"
        value={water}
        unit="L"
      />
      <Metric
        icon={<Leaf size={19} />}
        label="Korunan gıda"
        value={food}
        unit="kg"
      />
    </div>
  );
}

export function Vitality({ health }: { health: number }) {
  return (
    <div className="vitality">
      <div>
        <span>
          <Heart size={14} /> Canlılık
        </span>
        <strong>%{formatNumber(health, 0)}</strong>
      </div>
      <div
        className="vitality-track"
        role="meter"
        aria-label="Canlılık"
        aria-valuenow={Math.round(health)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span
          style={{
            width: `${health}%`,
            background: health < 45 ? "var(--ui-amber)" : undefined,
          }}
        />
      </div>
    </div>
  );
}

export function PlantStats({ plant }: { plant: Plant }) {
  return (
    <div className="plant-dimensions">
      <div>
        <MoveVertical size={16} />
        <strong>
          {formatNumber(plant.height, 2)} <small>m</small>
        </strong>
        <span>Boy</span>
      </div>
      <div>
        <MoveHorizontal size={16} />
        <strong>
          {formatNumber(plant.width, 2)} <small>m</small>
        </strong>
        <span>Genişlik</span>
      </div>
      <div>
        <CalendarDays size={16} />
        <strong>
          {plant.age} <small>gün</small>
        </strong>
        <span>Yaş</span>
      </div>
    </div>
  );
}
