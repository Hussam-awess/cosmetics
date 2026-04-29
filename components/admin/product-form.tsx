'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product, Category } from '@/lib/types'
import { CategoryForm } from './category-form'
import { ImageUpload } from './image-upload'

interface ProductFormProps {
  product?: Product
  categories: Category[]
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentCategories, setCurrentCategories] = useState(categories)

  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    compare_at_price: product?.compare_at_price?.toString() || '',
    category_id: product?.category_id || '',
    image_url: product?.image_url || '',
    stock: product?.stock?.toString() || '0',
    featured: product?.featured || false,
    active: product?.active ?? true,
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const refreshCategories = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      setCurrentCategories(data || [])
    } catch (error) {
      console.error('Failed to refresh categories:', error)
    }
  }

  // Suggested categories for when no categories exist
  const suggestedCategories = [
    'Skincare', 'Makeup', 'Fragrance', 'Body Care', 'Hair Care', 'Face',
    'Lips', 'Eyes', 'Nails', 'Tools & Accessories', 'Gift Sets', 'Men\'s Grooming'
  ]

  // Add suggested category when selected
  const handleSuggestedCategorySelect = async (categoryName: string) => {
    try {
      const supabase = createClient()
      
      // First, let's create a temporary category ID for the form
      const tempId = `temp-${Date.now()}`
      
      // Try to check if category already exists
      let existingCategory = null
      try {
        const { data: existing, error: checkError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryName)
          .single()

        if (!checkError && existing) {
          existingCategory = existing
        }
      } catch (checkError) {
        console.log('Categories table might not exist, using fallback')
      }

      if (existingCategory) {
        // Category exists, set it as selected
        setFormData(d => ({ ...d, category_id: existingCategory.id }))
        return
      }

      // Try to create new category
      try {
        const { data: newCategory, error: insertError } = await supabase
          .from('categories')
          .insert({
            name: categoryName,
            slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: `Products related to ${categoryName.toLowerCase()}`
          })
          .select()
          .single()

        if (insertError) {
          console.log('Failed to insert category, using fallback')
          throw insertError
        }

        // Refresh categories and set the new one as selected
        await refreshCategories()
        setFormData(d => ({ ...d, category_id: newCategory.id }))
      } catch (insertError) {
        console.log('Database error, using localStorage fallback')
        
        // Fallback: Store category in localStorage for now
        const tempCategories = JSON.parse(localStorage.getItem('tempCategories') || '[]')
        const newTempCategory = {
          id: tempId,
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: `Products related to ${categoryName.toLowerCase()}`,
          created_at: new Date().toISOString()
        }
        tempCategories.push(newTempCategory)
        localStorage.setItem('tempCategories', JSON.stringify(tempCategories))
        
        // Add to current categories state
        setCurrentCategories(prev => [...prev, newTempCategory])
        setFormData(d => ({ ...d, category_id: tempId }))
        
        alert(`Category "${categoryName}" added locally. Please create the categories table in Supabase for permanent storage.`)
      }
    } catch (error) {
      console.error('Failed to add suggested category:', error)
      alert(`Failed to add category "${categoryName}". Please check your database setup.`)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(d => ({
      ...d,
      name,
      slug: product ? d.slug : generateSlug(name),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Validate required fields
      if (!formData.name || !formData.slug || !formData.price) {
        throw new Error('Please fill in all required fields')
      }

      const data = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        category_id: formData.category_id || null,
        image_url: formData.image_url || null,
        stock: parseInt(formData.stock),
        featured: formData.featured,
        active: formData.active,
        updated_at: new Date().toISOString(),
      }

      let result
      if (product) {
        // Update existing product
        const { data: updatedProduct, error: updateError } = await supabase
          .from('products')
          .update(data)
          .eq('id', product.id)
          .select()
          .single()

        if (updateError) {
          console.error('Update error:', updateError)
          if (updateError.message.includes('relation "products" does not exist')) {
            throw new Error('Products table does not exist. Please run the database setup script.')
          }
          throw updateError
        }
        result = updatedProduct
      } else {
        // Create new product
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert(data)
          .select()
          .single()

        if (insertError) {
          console.error('Insert error details:', {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code
          })
          
          if (insertError.message.includes('relation "products" does not exist')) {
            throw new Error('Products table does not exist. Please run the database setup script.')
          }
          if (insertError.message.includes('duplicate key')) {
            throw new Error('A product with this slug already exists. Please use a different slug.')
          }
          if (insertError.message.includes('permission denied')) {
            throw new Error('Permission denied. Please check RLS policies in Supabase.')
          }
          throw new Error(`Database error: ${insertError.message || 'Unknown error'}`)
        }
        result = newProduct
      }

      if (result) {
        router.push('/admin/products')
        router.refresh()
      } else {
        throw new Error('Failed to save product. Please try again.')
      }
    } catch (err) {
      console.error('Form error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to save product'
      
      // Provide helpful error messages
      if (errorMessage.includes('table does not exist')) {
        setError(errorMessage + ' Please run the SQL script in Supabase to create the products table.')
      } else if (errorMessage.includes('permission denied')) {
        setError('Permission denied. Please check your database permissions.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Management */}
      <CategoryForm onCategoryAdded={refreshCategories} />

      {/* Basic Info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-foreground">
              Product Name
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={handleNameChange}
              className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Enter product name"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="slug" className="block text-sm font-medium text-foreground">
              URL Slug
            </label>
            <input
              type="text"
              id="slug"
              required
              value={formData.slug}
              onChange={e => setFormData(d => ({ ...d, slug: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="product-url-slug"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              placeholder="Enter product description"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-foreground">
              Category
            </label>
            <select
              id="category"
              value={formData.category_id}
              onChange={e => {
                const value = e.target.value
                if (value.startsWith('suggested-')) {
                  // Handle suggested category selection
                  const categoryName = value.replace('suggested-', '')
                  handleSuggestedCategorySelect(categoryName)
                } else {
                  // Handle normal category selection
                  setFormData(d => ({ ...d, category_id: value }))
                }
              }}
              className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select category</option>
              
              {/* Existing categories */}
              {currentCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
              
              {/* Suggested categories when no categories exist */}
              {currentCategories.length === 0 && (
                <>
                  <option disabled>─────────────</option>
                  <option disabled>Quick Add Categories:</option>
                  {suggestedCategories.map((category, index) => (
                    <option key={`suggested-${index}`} value={`suggested-${category}`}>
                      {category} (click to add)
                    </option>
                  ))}
                  <option disabled>─────────────</option>
                  <option disabled>Or add custom categories above</option>
                </>
              )}
            </select>
          </div>

          <div className="sm:col-span-2">
            <ImageUpload
              value={formData.image_url}
              onChange={(url) => setFormData(d => ({ ...d, image_url: url }))}
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Pricing & Inventory</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-foreground">
              Price (TZS)
            </label>
            <input
              type="number"
              id="price"
              required
              min="0"
              step="1"
              value={formData.price}
              onChange={e => setFormData(d => ({ ...d, price: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="0"
            />
          </div>

          <div>
            <label htmlFor="compare_at_price" className="block text-sm font-medium text-foreground">
              Compare at Price (TZS)
            </label>
            <input
              type="number"
              id="compare_at_price"
              min="0"
              step="1"
              value={formData.compare_at_price}
              onChange={e => setFormData(d => ({ ...d, compare_at_price: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Optional"
            />
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-foreground">
              Stock
            </label>
            <input
              type="number"
              id="stock"
              required
              min="0"
              value={formData.stock}
              onChange={e => setFormData(d => ({ ...d, stock: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Status</h2>
        <div className="mt-4 space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={e => setFormData(d => ({ ...d, active: e.target.checked }))}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground">Active (visible in store)</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={e => setFormData(d => ({ ...d, featured: e.target.checked }))}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground">Featured (show on homepage)</span>
          </label>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : product ? (
            'Update Product'
          ) : (
            'Create Product'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
