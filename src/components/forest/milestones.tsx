import { Check, Sprout, Leaf, Trees } from "lucide-react";
import { formatNumber } from "./stats";
const milestones = [
  { title: "İlk kökler", goal: 10, icon: Sprout },
  { title: "Yeşeren dostluklar", goal: 100, icon: Leaf },
  { title: "Kocaman bir gelecek", goal: 1000, icon: Trees },
];
export function Milestones({ growth }: { growth: number }) {
  return (
    <section className="milestone-section">
      <div className="section-heading">
        <h2>Ortak hedefler</h2>
      </div>
      <div className="milestones">
        {milestones.map(({ title, goal, icon: Icon }) => (
          <div className="milestone" key={goal}>
            <span className="milestone-icon">
              {growth >= goal ? <Check size={19} /> : <Icon size={19} />}
            </span>
            <div>
              <h3>{title}</h3>
              <progress
                aria-label={title}
                max={goal}
                value={Math.min(goal, growth)}
              />
              <small>
                {growth >= goal
                  ? "Tamamlandı"
                  : `${formatNumber(growth, 0)} / ${goal}`}
              </small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
