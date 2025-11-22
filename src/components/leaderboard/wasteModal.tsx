"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Leaf } from "lucide-react"
import type { Student, WasteRecord } from "@/lib/types"

interface WasteModalProps {
  student: Student | null
  isOpen: boolean
  onClose: () => void
}

interface DailyWaste {
  day: string
  waste: number
}

export function WasteModal({ student, isOpen, onClose }: WasteModalProps) {
  const [wasteData, setWasteData] = useState<DailyWaste[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!student) return

    const fetchDailyWaste = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/records?uid=${student.uid}`)
        if (!res.ok) throw new Error("Failed to fetch daily data")
        const json = await res.json()
        if (!json.success || !json.data || !json.data.records) throw new Error("Invalid response")

        const records: WasteRecord[] = json.data.records

        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        const today = new Date()

        const last7Days: DailyWaste[] = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(today)
          d.setDate(today.getDate() - (6 - i))
          const dayName = days[d.getDay()]

          const dayRecords = records.filter((r: WasteRecord) => {
            const rDate = new Date(r.createdAt)
            return rDate.toDateString() === d.toDateString()
          })

          const totalWaste = dayRecords.reduce((sum: number, r: WasteRecord) => sum + r.co2Emission, 0)
          return { day: dayName, waste: parseFloat(totalWaste.toFixed(1)) }
        })

        setWasteData(last7Days)
      } catch (err) {
        console.error(err)
        setWasteData([])
      } finally {
        setLoading(false)
      }
    }

    fetchDailyWaste()
  }, [student])

  if (!student) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-[80vw] md:max-w-2xl w-[90vw] px-2 xs:px-2 sm:px-4 py-4 max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full bg-secondary border-2 border-border flex items-center justify-center font-semibold text-xs xs:text-sm sm:text-base flex-shrink-0">
              {student.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg xs:text-xl sm:text-2xl truncate">{student.name}</DialogTitle>
              <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">Last 7 Days Waste Production</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 xs:space-y-4 sm:space-y-6 mt-1 xs:mt-2 sm:mt-4">
          {/* Summary Card */}
          <div className="p-2 xs:p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Leaf className="w-4 h-4 xs:w-5 xs:h-5 text-primary flex-shrink-0" />
                <span className="font-semibold text-xs xs:text-sm truncate">Total CO₂ Emissions</span>
              </div>
              <span className="text-lg xs:text-xl sm:text-2xl font-bold text-primary flex-shrink-0">
                {student.co2Emissions}
                <span className="text-[10px] xs:text-xs sm:text-sm font-normal text-muted-foreground ml-1">kg</span>
              </span>
            </div>
          </div>

          {/* Chart */}
          <div className="overflow-x-auto">
            <ChartContainer
              config={{ waste: { label: "Daily Waste", color: "text-primary" } }}
              className="h-[180px] xs:h-[220px] sm:h-[250px] md:h-[320px] min-w-[320px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wasteData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-[10px] xs:text-xs" tick={{ fontSize: 11 }} />
                  <YAxis className="text-[10px] xs:text-xs" tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="waste" fill="#008C49" radius={[8, 8, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            {loading && <p className="text-xs text-muted-foreground mt-2 text-center">Yükleniyor...</p>}
          </div>

          {/* Footer Info */}
          <div className="text-center text-[10px] xs:text-xs sm:text-sm text-muted-foreground px-1 xs:px-2">
            <p className="text-pretty">Daily waste measurements in kilograms of CO₂ equivalent</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
