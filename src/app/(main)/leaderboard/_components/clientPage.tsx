"use client"

import { trpc } from "@/utils/trpc"
import { Crown, Medal, Trophy } from "lucide-react"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

interface TrackingPosition {
  position: number
  userId?: string
  totalAmount?: number
  user?: {
    id: string
    username: string
  }
}

export const LeaderboardPage = () => {
  const { data, isLoading } = trpc.main.findLeaderboards.useQuery()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.div className="space-y-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          
            <h1 className="text-4xl font-bold  bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
              Leaderboard
            </h1>
            <h3 className="text-md font-semibold ">
            Top 10 Pembelian Terbanyak di OURASTORE. 
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              Berikut ini adalah daftar 10 pembelian terbanyak yang dilakukan
              oleh pelanggan kami. Data ini diambil dari sistem kami dan selalu diperbaharui.
            </p>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl shadow-lg border p-6">
                <Skeleton className="h-8 w-32 mb-6" />
                <div className="space-y-4">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LeaderboardCard title="Top 10 Hari ini" data={data?.daily as TrackingPosition[]} />
            <LeaderboardCard title="Top 10 Minggu ini" data={data?.weekly as TrackingPosition[]} />
            <LeaderboardCard title="Top 10 Bulan ini" data={data?.monthly as TrackingPosition[]} />
          </div>
        )}

       
      </div>
    </div>
  )
}

export const LeaderboardCard = ({ title, data }: { title: string; data: TrackingPosition[] }) => {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{position}</span>
    }
  }



  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-xl shadow-lg  overflow-hidden"
    >
      <div className="p-4 bg-primary/5 border-b">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <motion.div className="p-4 space-y-2"  initial="hidden" animate="show">
        {data?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Belum ada data tersedia</div>
        ) : (
          data?.map((item, index) => (
            <motion.div
              key={item.userId}
              className={`flex justify-between items-center  rounded-lg transition-colors `}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full ">
                  {getPositionIcon(item.position)}
                </div>
                <span className="font-medium truncate max-w-[120px]">{item.user?.username || "Unknown User"}</span>
              </div>
              <div className="font-bold text-primary">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
                  item.totalAmount as number,
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  )
}

