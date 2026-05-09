'use client'

interface EtymologyCardProps {
  fact: string
  answer: string
}

export default function EtymologyCard({ fact, answer }: EtymologyCardProps) {
  return (
    <div className="bg-[#EAF3DE] border border-[#3B6D11]/30 rounded-xl p-4 fade-up">
      <p className="text-sm text-[#3B6D11] uppercase tracking-wider mb-2 font-medium">
        Etymology — {answer}
      </p>
      <p className="text-sm text-[#27500A] leading-relaxed">{fact}</p>
    </div>
  )
}
