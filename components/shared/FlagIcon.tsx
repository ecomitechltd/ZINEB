'use client'

import { hasFlag } from 'country-flag-icons'
import * as Flags from 'country-flag-icons/react/3x2'

interface FlagIconProps {
  code: string
  className?: string
}

export function FlagIcon({ code, className = 'w-10 h-7' }: FlagIconProps) {
  const upperCode = code.toUpperCase()

  if (!hasFlag(upperCode)) {
    return (
      <div className={`${className} bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs font-bold`}>
        {upperCode}
      </div>
    )
  }

  const FlagComponent = (Flags as Record<string, React.ComponentType<{ className?: string }>>)[upperCode]

  if (!FlagComponent) {
    return (
      <div className={`${className} bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs font-bold`}>
        {upperCode}
      </div>
    )
  }

  return <FlagComponent className={`${className} rounded shadow-sm`} />
}
