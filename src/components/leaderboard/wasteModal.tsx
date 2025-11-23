"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Leaf, Droplets, TrendingDown, CalendarDays, Trees } from "lucide-react"
import type { Student, WasteRecord, DailyWaste, WasteTypeStats } from "@/lib/types"

interface WasteModalProps {
  student: Student | null
  isOpen: boolean
  onClose: () => void
}

export function WasteModal({ student, isOpen, onClose }: WasteModalProps) {
  const [dailyData, setDailyData] = useState<DailyWaste[]>([])
  const [wasteTypeStats, setWasteTypeStats] = useState<WasteTypeStats[]>([])
  const [totalWeight, setTotalWeight] = useState(0)
  const [recordCount, setRecordCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!student) return

    const fetchDetailedData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/records?uid=${student.uid}`)
        if (!res.ok) throw new Error("Failed to fetch detailed data")
        const json = await res.json()
        if (!json.success || !json.data) throw new Error("Invalid response")

        const records: WasteRecord[] = json.data.records || []
        const aggregated = json.data.aggregated || {}
        
        setRecordCount(records.length)

        // Calculate daily data for last 7 days
        const days = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"]
        const today = new Date()

        const last7Days: DailyWaste[] = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(today)
          d.setDate(today.getDate() - (6 - i))
          const dayName = days[d.getDay()]

          const dayRecords = records.filter((r: WasteRecord) => {
            const rDate = new Date(r.createdAt)
            return rDate.toDateString() === d.toDateString()
          })

          const totalCO2 = dayRecords.reduce((sum: number, r: WasteRecord) => sum + r.co2Emission, 0)
          const totalWater = dayRecords.reduce((sum: number, r: WasteRecord) => sum + (r.waterFootprint || 0), 0)
          
          return { 
            day: dayName, 
            co2: parseFloat((totalCO2 / 1000).toFixed(2)),
            water: parseFloat((totalWater / 1000).toFixed(2))
          }
        })

        setDailyData(last7Days)

        // Calculate waste type statistics
        const wasteTypes = ['Sebze ve Meyveler', 'Süt ve Süt Ürünleri', 'Et Ürünleri']
        let totalW = 0
        
        const typeStats: WasteTypeStats[] = [0, 1, 2].map((typeNum) => {
          const data = aggregated[typeNum] || { weight: 0, co2: 0, water: 0 }
          totalW += data.weight || 0
          return {
            type: wasteTypes[typeNum],
            weight: parseFloat((data.weight || 0).toFixed(2)),
            co2: parseFloat(((data.co2 || 0) / 1000).toFixed(2)),
            water: parseFloat(((data.water || 0) / 1000).toFixed(2))
          }
        }).filter(stat => stat.weight > 0)

        setWasteTypeStats(typeStats)
        setTotalWeight(parseFloat((totalW / 1000).toFixed(2)))

      } catch (err) {
        console.error(err)
        setDailyData([])
        setWasteTypeStats([])
      } finally {
        setLoading(false)
      }
    }

    fetchDetailedData()
  }, [student])

  if (!student) return null

  const CO2_PER_TREE_PER_YEAR = 22
  const treesNeeded = Math.ceil(student.co2Emissions / CO2_PER_TREE_PER_YEAR)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[85vw] md:max-w-3xl lg:max-w-4xl w-full px-3 xs:px-4 sm:px-6 py-4 sm:py-6 max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-14 sm:h-14 rounded-full bg-secondary border-2 border-border flex items-center justify-center font-semibold text-sm xs:text-base sm:text-lg flex-shrink-0">
              {student.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg xs:text-xl sm:text-2xl md:text-3xl truncate">{student.name}</DialogTitle>
              <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">Çevresel Etki Özeti</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-5 md:space-y-6 mt-2 sm:mt-3">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* CO2 Card */}
            <div className="p-3 sm:p-4 md:p-5 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm md:text-base truncate">CO₂ Emisyonları</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600">
                  {student.co2Emissions.toFixed(2)}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground">kg</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">Toplam karbon ayak izi</p>
            </div>

            {/* Water Card */}
            <div className="p-3 sm:p-4 md:p-5 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm md:text-base truncate">Su Ayak İzi</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">
                  {(student.waterFootprint || 0).toFixed(2)}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground">L</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">Üretimde kullanılan toplam su</p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Toplam Atık</span>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">{totalWeight} <span className="text-xs sm:text-sm font-normal">kg</span></p>
            </div>
            
            <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Kayıtlar</span>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">{recordCount} <span className="text-xs sm:text-sm font-normal">giriş</span></p>
            </div>
          </div>

          {/* Tree Offset Note */}
          <div className="p-4 sm:p-5 md:p-6 rounded-lg bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 border-2 border-emerald-500/30 shadow-sm">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Trees className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm sm:text-base md:text-lg text-emerald-700 mb-1 sm:mb-2">
                  🌳 Karbon Dengeleme Eşdeğeri
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-foreground/80 leading-relaxed mb-2 sm:mb-3">
                  <strong className="text-emerald-700">{student.co2Emissions.toFixed(2)} kg</strong> CO₂ emisyonunuzu dengelemek için yaklaşık olarak:
                </p>
                <div className="flex items-baseline gap-2 p-2 sm:p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-emerald-500/20">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-600">
                    {treesNeeded}
                  </span>
                  <span className="text-sm sm:text-base md:text-lg text-emerald-700 font-medium">
                    {treesNeeded === 1 ? 'ağaç' : 'ağaç'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 sm:mt-3 italic">
                  * Ortalama bir ağacın yılda ~22 kg CO₂ absorbe ettiği varsayılarak
                </p>
              </div>
            </div>
          </div>

          {/* Waste Type Breakdown */}
          {wasteTypeStats.length > 0 && (
            <div className="p-3 sm:p-4 md:p-5 rounded-lg bg-card border">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Atık Kategorisi Dağılımı</h3>
              <div className="space-y-2 sm:space-y-3">
                {wasteTypeStats.map((stat, idx) => (
                  <div key={idx} className="space-y-1 sm:space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-medium">{stat.type}</span>
                      <span className="text-muted-foreground">{stat.weight} kg</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                      <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded bg-green-500/10">
                        <Leaf className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        <span className="text-green-700 font-medium">{stat.co2} kg CO₂</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded bg-blue-500/10">
                        <Droplets className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        <span className="text-blue-700 font-medium">{stat.water} L H₂O</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Chart */}
          <div className="p-3 sm:p-4 md:p-5 rounded-lg bg-card border">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Son 7 Günlük Etki</h3>
            <div className="overflow-x-auto">
              <ChartContainer
                config={{
                  co2: { label: "CO₂ (kg)", color: "#10b981" },
                  water: { label: "Water (L)", color: "#3b82f6" }
                }}
                className="h-[200px] sm:h-[250px] md:h-[300px] min-w-[320px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-[10px] xs:text-xs" tick={{ fontSize: 10 }} />
                    <YAxis className="text-[10px] xs:text-xs" tick={{ fontSize: 10 }} />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      iconType="circle"
                    />
                    <Bar dataKey="co2" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} name="CO₂ (kg)" />
                    <Bar dataKey="water" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} name="Water (L)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              {loading && <p className="text-xs text-muted-foreground mt-2 text-center">Yükleniyor...</p>}
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center text-[10px] xs:text-xs sm:text-sm text-muted-foreground px-1 xs:px-2 py-2 sm:py-3 bg-muted/30 rounded-lg">
            <p className="text-pretty leading-relaxed">
              <strong>CO₂ Emisyonları:</strong> Atık üretiminden kaynaklanan karbon ayak izi. 
              <strong className="ml-2">Su Ayak İzi:</strong> Üretim döngüsünde kullanılan toplam su.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}