import { SkeletonPulse } from '../atoms/SkeletonPulse'

function SkeletonTimelineCard() {
  return (
    <div className="skeleton-card">
      <SkeletonPulse width="20px" height={20} borderRadius={4} />
      <div className="skeleton-card-body">
        <div className="skeleton-card-tags">
          <SkeletonPulse width="56px" height={18} borderRadius={8} />
          <SkeletonPulse width="70px" height={18} borderRadius={8} />
          <SkeletonPulse width="40px" height={14} borderRadius={4} />
        </div>
        <SkeletonPulse height={13} />
        <SkeletonPulse width="65%" height={13} />
      </div>
    </div>
  )
}

function SkeletonWeekBucket({ cardCount }: { cardCount: number }) {
  return (
    <div>
      <div className="skeleton-bucket-hdr">
        <SkeletonPulse width="10px" height={10} borderRadius={10} />
        <SkeletonPulse width="80px" height={14} borderRadius={6} />
        <SkeletonPulse width="60px" height={18} borderRadius={8} />
        <SkeletonPulse width="36px" height={18} borderRadius={8} />
        <SkeletonPulse width="36px" height={18} borderRadius={8} />
        <div className="skeleton-bucket-bar">
          <SkeletonPulse height={5} borderRadius={3} />
        </div>
      </div>

      <div className="skeleton-day-divider">
        <SkeletonPulse width="80px" height={10} borderRadius={4} />
      </div>

      {Array.from({ length: cardCount }).map((_, i) => (
        <SkeletonTimelineCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonTimeline() {
  return (
    <>
      <SkeletonWeekBucket cardCount={5} />
      <SkeletonWeekBucket cardCount={3} />
      <SkeletonWeekBucket cardCount={2} />
    </>
  )
}
