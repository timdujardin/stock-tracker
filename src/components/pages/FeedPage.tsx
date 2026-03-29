import type { FC } from 'react';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ErrorDisplay } from '@/components/atoms/ErrorDisplay';
import { SkeletonFeed } from '@/components/organisms/SkeletonFeed';
import { useNewsFeed } from '@/contexts/NewsFeedContext';
import { createNotFoundError } from '@/types/errors';

const CategoryPage = lazy(() => import('./CategoryPage').then((m) => ({ default: m.CategoryPage })));

/** Renders the main feed page with loading, error, and routed category views */
export const FeedPage: FC = () => {
  const { articles, isLoading, feedError, refreshFeed } = useNewsFeed();

  if (isLoading && !articles.length) {
    return <SkeletonFeed />;
  }

  if (feedError && !articles.length) {
    return <ErrorDisplay error={feedError} onRetry={refreshFeed} />;
  }

  if (!articles.length) {
    return <ErrorDisplay error={createNotFoundError('Geen artikels gevonden.')} onRetry={refreshFeed} />;
  }

  return (
    <Suspense fallback={<SkeletonFeed />}>
      <Routes>
        <Route path="/:categoryId" element={<CategoryPage />} />
        <Route path="*" element={<Navigate to="/vd" replace />} />
      </Routes>
    </Suspense>
  );
};
