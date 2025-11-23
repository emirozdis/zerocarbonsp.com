"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { PodiumStep } from "@/components/leaderboard/podiumStep"
import { LeaderboardItem } from "@/components/leaderboard/leaderboardItem"
import { WasteModal } from "@/components/leaderboard/wasteModal"
import type { Student } from "@/lib/types"

export default function Leaderboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchLeaderboardData()
  }, [])

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/records", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error("Failed to fetch leaderboard data")

      const result = await response.json()
      if (!result.success || !result.data) throw new Error(result.error || "Invalid response format")

      const studentsData: Student[] = result.data.map((user: any, index: number) => ({
        id: typeof user.id === "number" ? user.id : index,
        uid: user.uid,
        name: user.displayName,
        displayName: user.displayName,
        totalCO2: (user.totalCO2 || 0) / 1000,
        co2Emissions: (user.totalCO2 || 0) / 1000,
        totalWater: (user.totalWater || 0) / 1000,
        waterFootprint: (user.totalWater || 0) / 1000,
        avatar: user.displayName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      }))

      studentsData.sort((a, b) => a.totalCO2 - b.totalCO2)
      setStudents(studentsData)
    } catch (err) {
      console.error("Error fetching leaderboard:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <main className="min-h-screen py-8 px-4 md:py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Veriler yükleniyor...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen py-8 px-4 md:py-12 flex items-center justify-center">
        <Card className="p-6 border-destructive/50 bg-destructive/10 max-w-md">
          <h2 className="text-lg font-semibold text-destructive mb-2">Hata</h2>
          <p className="text-foreground/70">{error}</p>
          <button
            onClick={fetchLeaderboardData}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
          >
            Tekrar Dene
          </button>
        </Card>
      </main>
    )
  }

  if (students.length === 0) {
    return (
      <main className="min-h-screen py-8 px-4 md:py-12 flex items-center justify-center">
        <Card className="p-6 max-w-md text-center">
          <p className="text-foreground/70">Henüz katılımcı yok</p>
        </Card>
      </main>
    )
  }

  const topThree = students.slice(0, 3)
  const restOfStudents = students.slice(3)
  const podiumOrder = [
    topThree[1] || null,
    topThree[0] || null,
    topThree[2] || null,
  ].filter((s): s is Student => s !== null)

  return (
    <main className="min-h-screen py-8 px-4 md:py-12">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 md:space-y-12 px-4 sm:px-6">
        <div className="text-center space-y-2 sm:space-y-3 md:space-y-4 pt-18 md:pt-24">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance px-2">
            Yeşil Liderlik Tablosu
          </h1>
        </div>

        {podiumOrder.length > 0 && (
          <div className="relative">
            <div
              className={`grid gap-1.5 sm:gap-2 md:gap-4 items-end max-w-3xl mx-auto ${
                podiumOrder.length === 1 ? "grid-cols-1 max-w-xs" :
                podiumOrder.length === 2 ? "grid-cols-2 max-w-sm" :
                "grid-cols-3"
              }`}
            >
              {podiumOrder.map((student) => {
                const actualRank = topThree.findIndex((s) => s.uid === student.uid) + 1
                return (
                  <PodiumStep
                    key={student.uid}
                    student={student}
                    rank={actualRank}
                    onClick={() => handleStudentClick(student)}
                  />
                )
              })}
            </div>
          </div>
        )}

        {restOfStudents.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 px-2">
              Diğer Katılımcılar
            </h2>
            <div className="space-y-2">
              {restOfStudents.map((student, idx) => (
                <LeaderboardItem
                  key={student.uid}
                  student={student}
                  rank={topThree.length + idx + 1}
                  onClick={() => handleStudentClick(student)}
                />
              ))}
            </div>
          </div>
        )}

        {students.length > 0 && students.length <= 3 && restOfStudents.length === 0 && (
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-foreground/60">
              {students.length === 1 ? "1 katılımcı bulunuyor" : `${students.length} katılımcı bulunuyor`}
            </p>
          </div>
        )}

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