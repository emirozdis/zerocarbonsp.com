"use client"

import { Trophy, Medal, Award } from "lucide-react"

interface Student {
  id: number
  name: string
  co2Emissions: number
  avatar: string
}

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
        <div className="text-center px-1">
          <p className="font-semibold text-xs sm:text-sm md:text-base text-balance leading-tight">{student.name}</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary mt-0.5 sm:mt-1">
            {student.co2Emissions}
            <span className="text-[10px] sm:text-xs md:text-sm font-normal text-muted-foreground ml-0.5 sm:ml-1">
              kg
            </span>
          </p>
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
