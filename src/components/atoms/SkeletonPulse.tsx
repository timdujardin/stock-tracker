interface SkeletonPulseProps {
  width?: string
  height?: number
  borderRadius?: number
  className?: string
}

export function SkeletonPulse({
  width = '100%',
  height = 12,
  borderRadius = 6,
  className = '',
}: SkeletonPulseProps) {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{ inlineSize: width, blockSize: height, borderRadius }}
    />
  )
}
