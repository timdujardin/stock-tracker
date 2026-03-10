import { SkeletonPulse } from '../atoms/SkeletonPulse'

function SkeletonArticleCard() {
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
        <SkeletonPulse width="75%" height={13} />
      </div>
    </div>
  )
}

function SkeletonColumn() {
  return (
    <div className="feed-col skeleton-col">
      <div className="skeleton-col-hdr">
        <SkeletonPulse width="20px" height={16} borderRadius={4} />
        <SkeletonPulse width="100px" height={14} borderRadius={6} />
        <SkeletonPulse width="28px" height={14} borderRadius={6} />
      </div>

      <div className="skeleton-col-bar">
        <SkeletonPulse height={6} borderRadius={3} />
        <div className="skeleton-col-bar-labels">
          <SkeletonPulse width="40px" height={10} borderRadius={4} />
          <SkeletonPulse width="40px" height={10} borderRadius={4} />
          <SkeletonPulse width="40px" height={10} borderRadius={4} />
        </div>
      </div>

      <div className="skeleton-col-summary">
        <SkeletonPulse width="130px" height={12} borderRadius={6} />
        <SkeletonPulse height={11} />
        <SkeletonPulse width="85%" height={11} />
      </div>

      <div className="skeleton-col-items">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonArticleCard key={i} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonCategoryGrid() {
  return (
    <div className="feed-grid">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonColumn key={i} />
      ))}
    </div>
  )
}
