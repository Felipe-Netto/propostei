import logoProposteiLight from '@/assets/logo_propostei_light.png'
import logoProposteiDark from '@/assets/logo_propostei_dark.png'
import { cn } from '@/lib/utils'

type LogoSize = 'sm' | 'md' | 'lg'

interface LogoProps {
  white?: boolean
  className?: string
  size?: LogoSize
}

// The 500×500 PNG has ~28% transparent top, ~38% bottom, ~7% left, ~8% right.
// Each size renders the image at a fixed width and crops the transparent padding.
const sizeConfig: Record<LogoSize, {
  imgW: number
  containerW: number
  containerH: number
  offsetTop: number
  offsetLeft: number
}> = {
  sm: { imgW: 144, containerW: 126, containerH: 60, offsetTop: 40, offsetLeft: 10 },
  md: { imgW: 168, containerW: 147, containerH: 68, offsetTop: 47, offsetLeft: 12 },
  lg: { imgW: 200, containerW: 175, containerH: 80, offsetTop: 56, offsetLeft: 14 },
}

export function Logo({ white = false, className, size = 'sm' }: LogoProps) {
  const cfg = sizeConfig[size]
  return (
    <div
      className={cn('shrink-0 overflow-hidden', className)}
      style={{ width: cfg.containerW, height: cfg.containerH }}
    >
      <img
        src={white ? logoProposteiLight : logoProposteiDark}
        alt="Propostei"
        style={{
          width: cfg.imgW,
          height: 'auto',
          marginTop: -cfg.offsetTop,
          marginLeft: -cfg.offsetLeft,
        }}
      />
    </div>
  )
}
