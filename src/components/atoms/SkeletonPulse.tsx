interface SkeletonPulseProps {
  width?: string
  height?: string
  borderRadius?: string
  className?: string
}

export function SkeletonPulse({
  width = '100%',
  height = '0.75rem',
  borderRadius = '0.375rem',
  className = '',
}: SkeletonPulseProps) {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{ inlineSize: width, blockSize: height, borderRadius }}
    />
  )
}
