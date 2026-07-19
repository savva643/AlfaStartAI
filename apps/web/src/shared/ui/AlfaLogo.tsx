import { cn } from '@/shared/lib/utils'

interface AlfaLogoProps {
  className?: string
  size?: number
}

export function AlfaLogo({ className, size = 32 }: AlfaLogoProps) {
  return (
    <img
      src="/alfa.png"
      alt="Alfa"
      width={size}
      height={size}
      className={cn('shrink-0 object-contain', className)}
    />
  )
}
