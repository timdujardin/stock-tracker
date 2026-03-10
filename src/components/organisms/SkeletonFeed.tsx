import { SkeletonPulse } from '../atoms/SkeletonPulse'

function SkeletonCompactCard() {
  return (
    <div className="compact-card skeleton-compact-card">
      <SkeletonPulse width="56px" height={18} borderRadius={8} />
      <SkeletonPulse height={13} />
      <SkeletonPulse width="80%" height={13} />
      <SkeletonPulse width="60%" height={13} />
      <div className="skeleton-compact-meta">
        <SkeletonPulse width="50px" height={10} borderRadius={4} />
        <SkeletonPulse width="30px" height={10} borderRadius={4} />
      </div>
    </div>
  )
}

function SkeletonFeatured() {
  return (
    <section className="featured-section">
      <SkeletonPulse width="100px" height={16} borderRadius={6} />
      <div className="featured-cards" style={{ marginBlockStart: 10 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="featured-card skeleton-featured-card">
            <SkeletonPulse width="80px" height={18} borderRadius={8} />
            <SkeletonPulse width="56px" height={18} borderRadius={8} />
            <SkeletonPulse height={14} />
            <SkeletonPulse width="75%" height={14} />
            <div className="skeleton-compact-meta">
              <SkeletonPulse width="60px" height={10} borderRadius={4} />
              <SkeletonPulse width="30px" height={10} borderRadius={4} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function SkeletonCategorySection() {
  return (
    <section className="cat-section">
      <div className="cat-section-hdr skeleton-section-hdr">
        <SkeletonPulse width="140px" height={14} borderRadius={6} />
        <SkeletonPulse width="100px" height={5} borderRadius={3} />
      </div>
      <div className="article-slider">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCompactCard key={i} />
        ))}
      </div>
    </section>
  )
}

export function SkeletonFeed() {
  return (
    <>
      <SkeletonFeatured />
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCategorySection key={i} />
      ))}
    </>
  )
}
