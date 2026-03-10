import { useNewsFeed } from '../../contexts/NewsFeedContext'
import { getAllCategories } from '../../utils/categoryLookup.util'
import { FeaturedSection } from '../molecules/FeaturedSection'
import { CategorySection } from './CategorySection'

export function CategoryFeed() {
  const { articles } = useNewsFeed()
  const categories = getAllCategories()

  return (
    <>
      <FeaturedSection articles={articles} />
      {categories.map(category => (
        <CategorySection key={category.categoryId} category={category} />
      ))}
    </>
  )
}
