"use client";
import { useState } from "react";
import { Heart, Sprout, ChevronDown } from "lucide-react";
import type { MealOutcome } from "@/lib/forest/model";
import { formatNumber } from "./stats";
export function MealHistory({ history }: { history: MealOutcome[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? history : history.slice(0, 5);
  return (
    <section className="history-section" id="growth">
      <div className="section-heading">
        <h2>Gelişimim</h2>
      </div>
      <div className="meal-timeline">
        {visible.length ? (
          visible.map((item) => (
            <article key={item.id}>
              <span
                className={`timeline-icon ${item.score < 0 ? "stressed" : ""}`}
              >
                {item.score < 0 ? <Heart size={18} /> : <Sprout size={18} />}
              </span>
              <div>
                <strong>
                  {item.score > 0.1
                    ? "Yeni büyüme"
                    : item.score < -0.1
                      ? "Canlılık azaldı"
                      : "Dengeli öğün"}
                </strong>
                <small>
                  {new Date(item.date).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                  })}{" "}
                  · {formatNumber(item.weight, 0)} g atık
                </small>
              </div>
              <span className="timeline-result">
                {item.growth > 0
                  ? `+${formatNumber(item.growth, 2)}`
                  : `%${formatNumber(item.health, 0)}`}
              </span>
            </article>
          ))
        ) : (
          <p className="empty-note">Henüz öğün kaydı yok.</p>
        )}
      </div>
      {history.length > 5 && (
        <button
          className="history-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Daha az göster" : "Tümünü göster"}
          <ChevronDown
            size={15}
            style={{ transform: expanded ? "rotate(180deg)" : undefined }}
          />
        </button>
      )}
    </section>
  );
}
