import { Droplets, Leaf, Scale, Trees } from "lucide-react";
import { formatNumber } from "./stats";
import { impactMetrics, type EnvironmentalImpact } from "@/lib/forest/impact";
export type { EnvironmentalImpact } from "@/lib/forest/impact";

export function EnvironmentalImpactSummary({
  impact,
}: {
  impact: EnvironmentalImpact;
}) {
  const treesNeeded = Math.ceil(impact.co2Kilograms / 22);
  const metrics = impactMetrics(impact);

  return (
    <div className="environmental-impact-summary">
      <div className="environmental-impact-grid">
        {metrics.map((metric) => (
          <div className="environmental-impact-card" key={metric.key} title={metric.description}>
            <span>{metric.key === "carbon" ? <Leaf size={20} /> : metric.key === "water" ? <Droplets size={20} /> : <Scale size={20} />}</span>
            <small>{metric.label}</small>
            <strong>
              {formatNumber(metric.value, 3)} <em>{metric.unit}</em>
            </strong>
          </div>
        ))}
      </div>
      <p className="empty-note">Karbon ve su ayak izi, kayıtlı gıda atığının türüne ve ağırlığına göre tahmin edilir. Su değeri, gıdanın üretiminde kullanılan suyu ifade eder.</p>
      <div className="tree-offset-summary">
        <Trees size={24} />
        <div>
          <small>Karbon dengeleme eşdeğeri</small>
          <strong>{treesNeeded} ağaç</strong>
          <p>Bir ağacın yılda ortalama 22 kg CO₂ tuttuğu varsayılmıştır.</p>
        </div>
      </div>
    </div>
  );
}
