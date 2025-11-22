"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Leaf } from "lucide-react"
import { PodiumStep } from "./podiumStep"
import { LeaderboardItem } from "./leaderboardItem"
import { WasteModal } from "./wasteModal"

interface Student {
  id: number
  name: string
  co2Emissions: number
  avatar: string
}

// Sample data - sorted by CO2 emissions (lowest first)
const students: Student[] = [
  { id: 1, name: "Emma Chen", co2Emissions: 12.3, avatar: "EC" },
  { id: 2, name: "Marcus Johnson", co2Emissions: 15.7, avatar: "MJ" },
  { id: 3, name: "Sofia Rodriguez", co2Emissions: 18.2, avatar: "SR" },
  { id: 4, name: "Aiden Park", co2Emissions: 21.5, avatar: "AP" },
  { id: 5, name: "Olivia Thompson", co2Emissions: 23.8, avatar: "OT" },
  { id: 6, name: "Liam O'Brien", co2Emissions: 26.4, avatar: "LO" },
  { id: 7, name: "Zara Patel", co2Emissions: 29.1, avatar: "ZP" },
  { id: 8, name: "Noah Williams", co2Emissions: 31.6, avatar: "NW" },
]

export function Leaderboard() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const topThree = students.slice(0, 3)
  const restOfStudents = students.slice(3)

  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = [topThree[1], topThree[0], topThree[2]]

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 md:space-y-12 px-4 sm:px-6">
        {/* Header */}
        <div className="text-center space-y-2 sm:space-y-3 md:space-y-4 pt-4 sm:pt-6 md:pt-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-full bg-primary/10">
              <Leaf className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance px-2">
            CO₂ Emissions Leaderboard
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty px-4">
            {"Celebrating our eco-champions who are making the biggest impact on our planet"}
          </p>
        </div>

        {/* Podium - Improved responsive grid spacing */}
        <div className="relative">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-4 items-end max-w-3xl mx-auto">
            {podiumOrder.map((student) => {
              const actualRank = topThree.findIndex((s) => s.id === student.id) + 1
              return (
                <PodiumStep
                  key={student.id}
                  student={student}
                  rank={actualRank}
                  onClick={() => handleStudentClick(student)}
                />
              )
            })}
          </div>
        </div>

        {/* Rest of the List */}
        {restOfStudents.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 px-2">
              {"Other Participants"}
            </h2>
            <div className="space-y-2">
              {restOfStudents.map((student, idx) => {
                const rank = idx + 4
                return (
                  <LeaderboardItem
                    key={student.id}
                    student={student}
                    rank={rank}
                    onClick={() => handleStudentClick(student)}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Footer Message - Better responsive padding */}
        <div className="text-center max-w-2xl mx-auto pb-6 sm:pb-8">
          <Card className="p-4 sm:p-6 md:p-8 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <p className="text-xs sm:text-sm md:text-base font-semibold text-primary">{"Every kilogram counts!"}</p>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground text-pretty">
              {
                "Keep up the great work reducing your carbon footprint. Together, we're making a difference for our planet."
              }
            </p>
          </Card>
        </div>
      </div>

      <WasteModal student={selectedStudent} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
