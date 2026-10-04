"use client";
import { ArrowUpRight } from "lucide-react";
import type { Student } from "@/lib/types";
import { formatNumber } from "@/components/forest/stats";
export function LeaderboardItem({
  student,
  rank,
  onClick,
  isMe = false,
}: {
  student: Student;
  rank: number;
  onClick: () => void;
  isMe?: boolean;
}) {
  return (
    <button
      className={`leaderboard-row ${isMe ? "is-me" : ""}`}
      onClick={onClick}
    >
      <span className="leaderboard-rank">{student.wasteRatio === null ? "—" : rank}</span>
      <span className="leaderboard-avatar">{student.avatar}</span>
      <strong>
        {student.name}
        {isMe && <small>sen</small>}
      </strong>
      <span className="leaderboard-value">
        {student.wasteRatio === null ? "Henüz veri yok" : `%${formatNumber(student.wasteRatio * 100, 2)}`}
      </span>
      <span className="leaderboard-value leaderboard-water">
        {formatNumber(student.mealCount, 0)} <small>öğün</small>
      </span>
      <ArrowUpRight size={16} />
    </button>
  );
}
