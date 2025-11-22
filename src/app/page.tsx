"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { PodiumStep } from "@/components/leaderboard/podiumStep"
import { LeaderboardItem } from "@/components/leaderboard/leaderboardItem"
import { WasteModal } from "@/components/leaderboard/wasteModal"

interface Student {
  id: number
  name: string
  co2Emissions: number
  avatar: string
}

// Sample data - sorted by CO2 emissions (lowest first)
const students: Student[] = [
  { id: 1, name: "Elif Çetin", co2Emissions: 12.3, avatar: "EÇ" },
  { id: 2, name: "Mert Yılmaz", co2Emissions: 15.7, avatar: "MY" },
  { id: 3, name: "Seda Demir", co2Emissions: 18.2, avatar: "SD" },
  { id: 4, name: "Arda Kaya", co2Emissions: 21.5, avatar: "AK" },
  { id: 5, name: "Melisa Aydın", co2Emissions: 23.8, avatar: "MA" },
  { id: 6, name: "Can Özdemir", co2Emissions: 26.4, avatar: "CÖ" },
  { id: 7, name: "Zeynep Polat", co2Emissions: 29.1, avatar: "ZP" },
  { id: 8, name: "Deniz Yıldız", co2Emissions: 31.6, avatar: "DY" },
];

export default function Home() {
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
    <main className="min-h-screen py-8 px-4 md:py-12">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 md:space-y-12 px-4 sm:px-6">
        {/* Header */}
        <div className="text-center space-y-2 sm:space-y-3 md:space-y-4 pt-18 md:pt-24">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance px-2">
            Haftalık CO₂ Emisyonu <br /> Liderlik Tablosu
          </h1>
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
              Diğer Katılımcılar
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
          <Card className="p-6 sm:p-8 md:p-10 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/30 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
              <img src="/logo.svg" alt="Zero Carbon Project Logo" className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-primary">
                Projeye Katılın!
              </h3>
            </div>

            <p className="text-sm sm:text-base md:text-lg text-foreground/80 mb-5 sm:mb-6 text-pretty leading-relaxed">
              Liderlik tablosunda yerini alarak ödüller kazan! <br />
              <b>Detaylı bilgi ve katılım için: Yasemin Bilgin Kırkgöz</b>
            </p>

          </Card>
        </div>
      </div>

      <WasteModal student={selectedStudent} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </main>
  )
}