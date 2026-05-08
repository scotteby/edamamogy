'use client'
import { Root } from '@/types'

interface BeanProps {
  root: Root
  used: boolean
  onClick: () => void
}

export default function Bean({ root, used, onClick }: BeanProps) {
  return (
    <button
      onClick={onClick}
      disabled={used}
      className={`flex flex-col items-center px-4 py-2.5 rounded-2xl border-[1.5px] transition-all bean
        ${used
          ? 'opacity-30 cursor-default border-[#3B6D11]/30 bg-transparent'
          : 'border-[#3B6D11] bg-[#EAF3DE]/10 hover:bg-[#EAF3DE]/20 cursor-pointer'
        }`}
    >
      <span className={`text-sm font-medium ${used ? 'text-gray-500' : 'text-[#97C459]'}`}>
        {root.text}
      </span>
      <span className={`text-[10px] mt-0.5 ${used ? 'text-gray-600' : 'text-[#3B6D11]'}`}>
        {root.meaning}
      </span>
    </button>
  )
}
