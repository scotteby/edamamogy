'use client'

interface EtymologyCardProps {
  fact: string
  answer: string
}

export default function EtymologyCard({ fact, answer }: EtymologyCardProps) {
  return (
    <div className="bg-[#1a2e0a]/60 border border-[#3B6D11]/40 rounded-xl p-4 fade-up">
      <p className="text-sm text-[#3B6D11] uppercase tracking-wider mb-2 font-medium">
        Etymology — {answer}
      </p>
      <p className="text-sm text-[#97C459]/90 leading-relaxed">{fact}</p>
    </div>
  )
}
