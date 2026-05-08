'use client'
import { Root } from '@/types'

interface PodProps {
  slots: (Root | null)[]
  totalSlots: number
  revealed: boolean
  answer: string
  onRemove: (index: number) => void
}

export default function Pod({ slots, totalSlots, revealed, answer, onRemove }: PodProps) {
  return (
    <div className="bg-[#111827] border border-white/10 rounded-full px-5 py-3.5 flex items-center justify-center gap-1.5 min-h-[68px] flex-wrap">
      {Array.from({ length: totalSlots }).map((_, i) => {
        const root = slots[i]
        const isLast = i === totalSlots - 1

        return (
          <div key={i} className="flex items-center gap-1.5">
            {root ? (
              <button
                onClick={() => !revealed && onRemove(i)}
                disabled={revealed}
                className={`flex flex-col items-center px-4 py-1.5 rounded-full border-[1.5px] transition-all pod-slot-enter
                  ${revealed
                    ? 'bg-[#EAF3DE] border-[#3B6D11] cursor-default'
                    : 'bg-[#1a2e0a] border-[#3B6D11] hover:bg-[#EAF3DE]/10 cursor-pointer'
                  }`}
              >
                <span className={`text-sm font-medium ${revealed ? 'text-[#27500A]' : 'text-[#97C459]'}`}>
                  {root.text}
                </span>
                <span className={`text-[10px] ${revealed ? 'text-[#3B6D11]' : 'text-[#3B6D11]/70'}`}>
                  {root.meaning}
                </span>
              </button>
            ) : (
              <div className="flex flex-col items-center px-4 py-1.5 rounded-full border-[1.5px] border-dashed border-[#3B6D11]/40 min-w-[72px]">
                <span className="text-sm text-[#3B6D11]/30">root {i + 1}</span>
              </div>
            )}

            {!isLast && (
              <span className="text-gray-600 text-base font-medium">+</span>
            )}
          </div>
        )
      })}

      {totalSlots > 0 && (
        <>
          <span className="text-gray-600 text-base font-medium mx-1">=</span>
          {revealed ? (
            <span className="text-base font-medium text-white">{answer}</span>
          ) : (
            <span className="text-base text-gray-700">?</span>
          )}
        </>
      )}
    </div>
  )
}
