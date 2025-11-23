"use client"

import { Trophy, Medal, Award, Leaf, Droplets } from "lucide-react"
import type { Student } from "@/lib/types"

interface PodiumStepProps {
  student: Student
  rank: number
  onClick: () => void
}

const podiumHeights = {
  1: "h-32 sm:h-40 md:h-48",
  2: "h-24 sm:h-32 md:h-40",
  3: "h-20 sm:h-28 md:h-36",
}

const podiumColors = {
  1: "bg-gradient-to-br from-primary to-accent",
  2: "bg-gradient-to-br from-accent/80 to-primary/60",
  3: "bg-gradient-to-br from-accent/60 to-primary/40",
}

const medalIcons = {
  1: Trophy,
  2: Medal,
  3: Award,
}

const podiumIconColors = {
  1: "text-[#FFD700]", // gold
  2: "text-[#C0C0C0]", // silver
  3: "text-[#CD7F32]", // bronze
}

const podiumBgColors = {
  1: "bg-[#FFD700]", // gold
  2: "bg-[#C0C0C0]", // silver
  3: "bg-[#CD7F32]", // bronze
}

export function PodiumStep({ student, rank, onClick }: PodiumStepProps) {
  const Icon = medalIcons[rank as keyof typeof medalIcons]

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 cursor-pointer group" onClick={onClick}>
      {/* Student Info */}
      <div className="flex flex-col items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
        <div className="relative">
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-card border-2 sm:border-4 border-primary/20 flex items-center justify-center text-base sm:text-lg md:text-xl font-bold shadow-lg group-hover:scale-105 transition-transform">
            {student.avatar}
          </div>
          <div
            className={`absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full ${podiumBgColors[rank as keyof typeof podiumBgColors]} flex items-center justify-center shadow-lg`}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-black" />
          </div>
        </div>
        <div className="text-center px-1 w-full">
          <p className="font-semibold text-xs sm:text-sm md:text-base text-balance leading-tight mb-1.5 sm:mb-2">
            {student.name}
          </p>
          
          {/* Metrics Container */}
          <div className="flex flex-col gap-1 sm:gap-1.5 w-full">
            {/* CO2 Metric */}
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1 sm:py-1.5 rounded-md bg-green-500/10 border border-green-500/20">
              <Leaf className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm sm:text-base md:text-lg font-bold text-green-700">
                {student.co2Emissions.toFixed(2)}
              </span>
              <span className="text-[9px] sm:text-[10px] md:text-xs font-normal text-green-600/70">
                kg CO₂
              </span>
            </div>

            {/* Water Metric */}
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1 sm:py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20">
              <Droplets className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm sm:text-base md:text-lg font-bold text-blue-700">
                {(student.waterFootprint || 0).toFixed(2)}
              </span>
              <span className="text-[9px] sm:text-[10px] md:text-xs font-normal text-blue-600/70">
                L H₂O
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Podium Step */}
      <div
        className={`w-full ${podiumHeights[rank as keyof typeof podiumHeights]} ${podiumColors[rank as keyof typeof podiumColors]} rounded-t-lg flex items-center justify-center shadow-xl transition-all group-hover:scale-105`}
      >
        <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground/90">{rank}</span>
      </div>
    </div>
  )
}