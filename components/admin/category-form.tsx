'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus, Sparkles } from 'lucide-react'

interface CategoryFormProps {
  onCategoryAdded?: () => void
}

export function CategoryForm({ onCategoryAdded }: CategoryFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Suggested categories for beauty store
  const suggestedCategories = [
    { name: 'Skincare', description: 'Premium skincare products for healthy, glowing skin' },
    { name: 'Makeup', description: 'Professional makeup products for all occasions' },
    { name: 'Fragrance', description: 'Luxury perfumes and fragrances for men and women' },
    { name: 'Body Care', description: 'Nourishing body care products and treatments' },
    { name: 'Hair Care', description: 'Premium hair care products for all hair types' },
    { name: 'Face', description: 'Specialized face treatments and cosmetics' },
    { name: 'Lips', description: 'Lip care products and cosmetics' },
    { name: 'Eyes', description: 'Eye makeup and care products' },
    { name: 'Nails', description: 'Nail care products and polish' },
    { name: 'Tools & Accessories', description: 'Professional beauty tools and accessories' },
    { name: 'Gift Sets', description: 'Curated gift sets for special occasions' },
    { name: 'Men\'s Grooming', description: 'Grooming products specifically for men' },
    { name: 'Natural & Organic', description: 'Natural and organic beauty products' },
    { name: 'Anti-Aging', description: 'Products targeting anti-aging concerns' },
    { name: 'Sun Care', description: 'Sun protection and after-sun care' }
  ]
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(d => ({
      ...d,
      name,
      slug: generateSlug(name),
    }))
  }

  const handleSuggestedCategory = (category: typeof suggestedCategories[0]) => {
    setFormData({
      name: category.name,
      slug: generateSlug(category.name),
      description: category.description
    })
  }

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('categories')
        .insert({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null
        })

      if (error) throw error

      setSuccess('Category added successfully!')
      setFormData({ name: '', slug: '', description: '' })
      
      if (onCategoryAdded) {
        onCategoryAdded()
      }

      setTimeout(() => {
        setIsOpen(false)
        setSuccess(null)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant="outline" className="mb-4">
        <Plus className="h-4 w-4 mr-2" />
        Add New Category
      </Button>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Category
        </CardTitle>
        <CardDescription>Fill in the details below or choose from suggestions</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Suggested Categories */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Suggested Categories</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {suggestedCategories.map((category, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                className="justify-start h-auto p-3 text-left"
                onClick={() => handleSuggestedCategory(category)}
              >
                <div>
                  <div className="font-medium text-sm">{category.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {category.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g., Skincare, Makeup, Fragrance"
              />
            </div>
            <div>
              <Label htmlFor="category-slug">URL Slug</Label>
              <Input
                id="category-slug"
                type="text"
                required
                value={formData.slug}
                onChange={e => setFormData(d => ({ ...d, slug: e.target.value }))}
                placeholder="category-slug"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category-description">Description</Label>
            <Textarea
              id="category-description"
              rows={3}
              value={formData.description}
              onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
              placeholder="Optional category description"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Category'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
