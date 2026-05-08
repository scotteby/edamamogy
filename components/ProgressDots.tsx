'use client'

interface ProgressDotsProps {
  total: number
  current: number
  results: (boolean | null)[]
}

export default function ProgressDots({ total, current, results }: ProgressDotsProps) {
  return (
    <div className="flex gap-2 items-center">
      {Array.from({ length: total }).map((_, i) => {
        const result = results[i]
        const isCurrent = i === current
        return (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300
              ${result === true ? 'bg-[#3B6D11]' :
                result === false ? 'bg-red-500' :
                isCurrent ? 'border-[1.5px] border-[#3B6D11] bg-transparent' :
                'bg-white/10'
              }`}
          />
        )
      })}
    </div>
  )
}
