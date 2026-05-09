'use client'
import { Root } from '@/types'

interface PodProps {
  slots: (Root | null)[]
  totalSlots: number
  revealed: boolean
  answer: string
  onRemove: (index: number) => void
}

const CX: Record<number, number[]> = {
  2: [120, 220],
  3: [97, 170, 243],
}

export default function Pod({ slots, totalSlots, revealed, answer, onRemove }: PodProps) {
  const cx = CX[totalSlots] || CX[3]
  const height = 100

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100%" viewBox="0 0 340 100" role="img" aria-label={`Word assembly pod with ${totalSlots} bean slots`}>
        {/* Pod body */}
        <path
          d="M20 50 C20 22, 46 10, 84 10 L256 10 C294 10, 320 22, 320 50 C320 78, 294 90, 256 90 L84 90 C46 90, 20 78, 20 50 Z"
          fill={revealed ? '#3B6D11' : '#4a7a18'}
          stroke="#27500A"
          strokeWidth="1.5"
          style={{ transition: 'fill 0.4s' }}
        />
        {/* Stem curls */}
        <path d="M16 43 C10 47, 10 53, 16 57" fill="none" stroke="#27500A" strokeWidth="2" strokeLinecap="round"/>
        <path d="M324 43 C330 47, 330 53, 324 57" fill="none" stroke="#27500A" strokeWidth="2" strokeLinecap="round"/>

        {/* Bean slots */}
        {Array.from({ length: totalSlots }).map((_, i) => {
          const root = slots[i]
          const x = cx[i]
          const filled = !!root

          return (
            <g
              key={i}
              onClick={() => !revealed && filled && onRemove(i)}
              style={{ cursor: !revealed && filled ? 'pointer' : 'default' }}
            >
              <ellipse
                cx={x}
                cy={50}
                rx={totalSlots === 2 ? 42 : 36}
                ry={30}
                fill={filled ? '#EAF3DE' : 'rgba(234,243,222,0.4)'}
                stroke={filled ? '#27500A' : '#3B6D11'}
                strokeWidth="1"
                strokeDasharray={filled ? undefined : '3 2'}
                style={{ transition: 'fill 0.25s' }}
              />
              {filled ? (
                <text
                  x={x}
                  y={54}
                  textAnchor="middle"
                  fontFamily="system-ui, sans-serif"
                  fontSize={13}
                  fontWeight={500}
                  fill="#27500A"
                >
                  {root!.text}
                </text>
              ) : (
                <text
                  x={x}
                  y={54}
                  textAnchor="middle"
                  fontFamily="system-ui, sans-serif"
                  fontSize={11}
                  fill="#EAF3DE"
                >
                  root {i + 1}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Word revealed below pod */}
      <div
        className="text-lg font-medium transition-all duration-500"
        style={{
          color: '#3B6D11',
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'translateY(0)' : 'translateY(6px)',
          minHeight: '28px',
        }}
      >
        {revealed ? answer : ''}
      </div>
    </div>
  )
}