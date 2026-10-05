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
import { impactMetrics, type EnvironmentalImpact } from "@/lib/forest/impact";

export const formatNumber = (value: number, digits = 1) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: digits }).format(
    value,
  );

export function Metric({
  icon,
  label,
  value,
  unit,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  unit: string;
  description?: string;
}) {
  return (
    <div className="impact-stat" title={description}>
      <span className="impact-stat-icon">{icon}</span>
      <div>
        <span>{label}</span>
        {description && <span className="sr-only">{description}</span>}
        <strong>
          {formatNumber(value)} <small>{unit}</small>
        </strong>
      </div>
    </div>
  );
}

export function ImpactStats({
  impact,
  floating = false,
}: {
  impact: EnvironmentalImpact;
  floating?: boolean;
}) {
  return (
    <div className={`impact-stats ${floating ? "impact-stats-floating" : ""}`}>
      {impactMetrics(impact).map((metric) => (
        <Metric
          key={metric.key}
          icon={metric.key === "carbon" ? <Wind size={19} /> : metric.key === "water" ? <Droplets size={19} /> : <Leaf size={19} />}
          label={metric.label}
          value={metric.value}
          unit={metric.unit}
          description={metric.description}
        />
      ))}
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
