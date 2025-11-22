"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Student {
  id: number
  name: string
  co2Emissions: number
  avatar: string
}

interface LeaderboardItemProps {
  student: Student
  rank: number
  onClick: () => void
}

export function LeaderboardItem({ student, rank, onClick }: LeaderboardItemProps) {
  return (
    <Card
      className="p-3 sm:p-4 md:p-5 hover:shadow-lg transition-all hover:scale-[1.02] bg-card cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        {/* Rank */}
        <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-muted flex items-center justify-center">
          <span className="text-base sm:text-lg md:text-xl font-bold text-muted-foreground">{rank}</span>
        </div>

        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-secondary border-2 border-border flex items-center justify-center font-semibold text-xs sm:text-sm md:text-base">
          {student.avatar}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm sm:text-base md:text-lg truncate">{student.name}</p>
        </div>

        {/* Emissions */}
        <div className="flex-shrink-0 text-right">
          <Badge
            variant="secondary"
            className="text-sm sm:text-base md:text-lg font-bold px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2"
          >
            {student.co2Emissions}
            <span className="text-[10px] sm:text-xs font-normal ml-0.5 sm:ml-1">kg</span>
          </Badge>
        </div>
      </div>
    </Card>
  )
}
