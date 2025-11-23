"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, Droplets } from "lucide-react"
import type { Student } from "@/lib/types"

interface LeaderboardItemProps {
  student: Student
  rank: number
  onClick: () => void
}

export function LeaderboardItem({ student, rank, onClick }: LeaderboardItemProps) {
  return (
    <Card
      className="p-3 sm:p-4 md:p-5 hover:shadow-lg transition-all hover:scale-[1.01] bg-card cursor-pointer"
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
          <p className="text-[10px] sm:text-xs text-muted-foreground hidden xs:block">Click for details</p>
        </div>

        {/* Emissions - Desktop */}
        <div className="hidden md:flex flex-shrink-0 gap-3 lg:gap-4">
          <div className="flex items-center gap-1.5 lg:gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <Leaf className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div className="text-right">
              <div className="text-sm lg:text-base font-bold text-green-700">
                {student.co2Emissions.toFixed(2)}
                <span className="text-[10px] lg:text-xs font-normal ml-1">kg</span>
              </div>
              <div className="text-[9px] lg:text-[10px] text-green-600/70">CO₂</div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 lg:gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Droplets className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="text-right">
              <div className="text-sm lg:text-base font-bold text-blue-700">
                {(student.waterFootprint || 0).toFixed(2)}
                <span className="text-[10px] lg:text-xs font-normal ml-1">L</span>
              </div>
              <div className="text-[9px] lg:text-[10px] text-blue-600/70">H₂O</div>
            </div>
          </div>
        </div>

        {/* Emissions - Mobile & Tablet */}
        <div className="flex md:hidden flex-col gap-1.5 sm:gap-2 flex-shrink-0">
          <Badge
            variant="secondary"
            className="text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 bg-green-500/10 text-green-700 border-green-500/20 flex items-center gap-1"
          >
            <Leaf className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {student.co2Emissions.toFixed(2)}
            <span className="text-[9px] sm:text-[10px] font-normal">kg</span>
          </Badge>
          <Badge
            variant="secondary"
            className="text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 bg-blue-500/10 text-blue-700 border-blue-500/20 flex items-center gap-1"
          >
            <Droplets className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {(student.waterFootprint || 0).toFixed(2)}
            <span className="text-[9px] sm:text-[10px] font-normal">L</span>
          </Badge>
        </div>
      </div>
    </Card>
  )
}