import type { FC } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { CategorySection } from '@/components/organisms/CategorySection';
import { getCategoryById } from '@/utils/categoryLookup.util';

/** Renders a single category page based on the URL route parameter */
export const CategoryPage: FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = categoryId ? getCategoryById(categoryId) : undefined;

  if (!category) {
    return <Navigate to="/vd" replace />;
  }

  return <CategorySection category={category} />;
};
