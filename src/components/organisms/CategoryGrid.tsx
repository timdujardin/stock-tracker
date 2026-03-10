import { getAllCategories } from '../../utils/categoryLookup.util'
import { CategoryColumn } from './CategoryColumn'

export function CategoryGrid() {
  const categories = getAllCategories()

  return (
    <div className="feed-grid">
      {categories.map(category => (
        <CategoryColumn key={category.categoryId} category={category} />
      ))}
    </div>
  )
}
