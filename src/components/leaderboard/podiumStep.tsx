"use client";
import { Trophy, Medal, Award } from "lucide-react";
import type { Student } from "@/lib/types";
import { formatNumber } from "@/components/forest/stats";
const awards = { 1: Trophy, 2: Medal, 3: Award };
export function PodiumStep({
  student,
  rank,
  onClick,
}: {
  student: Student;
  rank: number;
  onClick: () => void;
}) {
  const Icon = awards[rank as keyof typeof awards] || Award;
  return (
    <button
      className={`podium-step podium-${rank}`}
      onClick={onClick}
      aria-label={`${rank}. ${student.name}, %${formatNumber((student.wasteRatio ?? 0) * 100, 2)} israf oranı`}
    >
      <span className="podium-medal">
        <Icon size={21} />
      </span>
      <span className="podium-avatar">{student.avatar}</span>
      <strong>{student.name}</strong>
      <span className="podium-emissions">
        %{formatNumber((student.wasteRatio ?? 0) * 100, 2)} <small>israf</small>
      </span>
      <span className="podium-water">
        {formatNumber(student.mealCount, 0)} öğün
      </span>
      <span className="podium-plinth">
        {rank}
        <span />
      </span>
    </button>
  );
}
