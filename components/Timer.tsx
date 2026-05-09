'use client'
import { useEffect, useState, useRef } from 'react'

interface TimerProps {
  maxTime: number
  running: boolean
  onExpire: () => void
  resetKey: number
}

export default function Timer({ maxTime, running, onExpire, resetKey }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(maxTime)
  const hasCountedRef = useRef(false)

  useEffect(() => {
    setTimeLeft(maxTime)
    hasCountedRef.current = false
  }, [resetKey, maxTime])

  useEffect(() => {
    if (!running) return
    if (timeLeft <= 0) {
      if (hasCountedRef.current) {
        hasCountedRef.current = false
        onExpire()
      }
      return
    }
    hasCountedRef.current = true
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, running, onExpire])

  const color = timeLeft > 10 ? 'text-[#3B6D11]' : timeLeft > 5 ? 'text-amber-400' : 'text-red-400'
  const borderColor = timeLeft > 10 ? 'border-[#3B6D11]/40' : timeLeft > 5 ? 'border-amber-400/40' : 'border-red-400/40'

  return (
    <div className={`text-sm font-medium px-3 py-1 rounded-full border bg-[#161d2e] ${color} ${borderColor}`}>
      {timeLeft}s
    </div>
  )
}
