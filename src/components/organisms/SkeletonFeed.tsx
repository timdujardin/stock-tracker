import { SkeletonPulse } from '../atoms/SkeletonPulse'

function SkeletonCompactCard() {
  return (
    <div className="compact-card skeleton-compact-card">
      <span className="compact-pill" style={{ borderColor: 'transparent' }}>
        <SkeletonPulse width="3rem" height="0.55rem" borderRadius="0.25rem" />
      </span>
      <span className="compact-title">
        <SkeletonPulse width="100%" height="0.72rem" borderRadius="0.25rem" />
        <SkeletonPulse width="85%" height="0.72rem" borderRadius="0.25rem" />
        <SkeletonPulse width="50%" height="0.72rem" borderRadius="0.25rem" />
      </span>
      <span className="compact-meta">
        <span className="compact-source">
          <SkeletonPulse width="4rem" height="0.6rem" borderRadius="0.2rem" />
        </span>
        <span className="compact-time">
          <SkeletonPulse width="2.5rem" height="0.6rem" borderRadius="0.2rem" />
        </span>
      </span>
    </div>
  )
}

function SkeletonFeaturedCard() {
  return (
    <div className="featured-card skeleton-featured-card">
      <span className="featured-cat" style={{ borderColor: 'transparent' }}>
        <SkeletonPulse width="4rem" height="0.6rem" borderRadius="0.25rem" />
      </span>
      <span className="featured-pill" style={{ borderColor: 'transparent' }}>
        <SkeletonPulse width="3rem" height="0.6rem" borderRadius="0.25rem" />
      </span>
      <span className="featured-title">
        <SkeletonPulse width="100%" height="0.8rem" borderRadius="0.25rem" />
        <SkeletonPulse width="70%" height="0.8rem" borderRadius="0.25rem" />
      </span>
      <span className="featured-meta">
        <SkeletonPulse width="3.5rem" height="0.6rem" borderRadius="0.2rem" />
        <SkeletonPulse width="2rem" height="0.6rem" borderRadius="0.2rem" />
      </span>
    </div>
  )
}

function SkeletonFeatured() {
  return (
    <section className="featured-section">
      <h2 className="featured-heading">
        <SkeletonPulse width="5rem" height="0.8rem" borderRadius="0.25rem" />
      </h2>
      <div className="featured-cards">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonFeaturedCard key={i} />
        ))}
      </div>
    </section>
  )
}

function SkeletonCategorySection() {
  return (
    <section className="cat-section">
      <div className="cat-section-hdr skeleton-section-hdr">
        <span className="cat-section-label">
          <SkeletonPulse width="7rem" height="0.8rem" borderRadius="0.25rem" />
        </span>
        <div className="cat-section-bar" style={{ background: 'transparent' }}>
          <SkeletonPulse width="100%" height="4px" borderRadius="2px" />
        </div>
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
