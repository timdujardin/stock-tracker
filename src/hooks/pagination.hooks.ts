import { useCallback, useMemo, useState } from 'react';

interface PaginatedResult<T> {
  displayedItems: T[];
  hasMore: boolean;
  remainingCount: number;
  showMore: () => void;
}

/** Paginates an array of items with a "show more" mechanism. */
/** @param items - Full array of items to paginate. */
/** @param pageSize - Number of items to reveal per page increment. */
/** @returns Displayed items, load-more state, and a showMore callback. */
export const usePagination = <T>(items: T[], pageSize: number): PaginatedResult<T> => {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const displayedItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasMore = items.length > visibleCount;
  const remainingCount = Math.min(pageSize, items.length - visibleCount);

  const showMore = useCallback(() => {
    setVisibleCount((prev) => prev + pageSize);
  }, [pageSize]);

  return { displayedItems, hasMore, remainingCount, showMore };
};
