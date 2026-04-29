'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, Loader2, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/lib/types'

interface CategoryListProps {
  categories: Category[]
  productCounts: Record<string, number>
}

export function CategoryList({ categories, productCounts }: CategoryListProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '' })
  const [editCategory, setEditCategory] = useState({ name: '', slug: '', description: '' })

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleAdd = async () => {
    if (!newCategory.name.trim()) return
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('categories').insert({
        name: newCategory.name,
        slug: newCategory.slug || generateSlug(newCategory.name),
        description: newCategory.description || null,
      })

      if (error) throw error

      setNewCategory({ name: '', slug: '', description: '' })
      setIsAdding(false)
      router.refresh()
    } catch (err) {
      console.error('Error adding category:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (id: string) => {
    if (!editCategory.name.trim()) return
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('categories')
        .update({
          name: editCategory.name,
          slug: editCategory.slug,
          description: editCategory.description || null,
        })
        .eq('id', id)

      if (error) throw error

      setEditingId(null)
      router.refresh()
    } catch (err) {
      console.error('Error editing category:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('categories').delete().eq('id', id)

      if (error) throw error

      router.refresh()
    } catch (err) {
      console.error('Error deleting category:', err)
    }
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setEditCategory({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Slug
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Products
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {categories.map(category => (
            <tr key={category.id} className="hover:bg-muted/30">
              {editingId === category.id ? (
                <>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={editCategory.name}
                      onChange={e => setEditCategory(d => ({ ...d, name: e.target.value, slug: generateSlug(e.target.value) }))}
                      className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={editCategory.slug}
                      onChange={e => setEditCategory(d => ({ ...d, slug: e.target.value }))}
                      className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={editCategory.description}
                      onChange={e => setEditCategory(d => ({ ...d, description: e.target.value }))}
                      className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {productCounts[category.id] || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(category.id)}
                        disabled={isSubmitting}
                        className="p-1 text-green-600 hover:text-green-700"
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-4 font-medium text-foreground">{category.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{category.slug}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground truncate max-w-xs">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {productCounts[category.id] || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(category)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}

          {/* Add new category row */}
          {isAdding && (
            <tr className="bg-muted/30">
              <td className="px-6 py-4">
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={e => setNewCategory(d => ({ ...d, name: e.target.value, slug: generateSlug(e.target.value) }))}
                  placeholder="Category name"
                  className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </td>
              <td className="px-6 py-4">
                <input
                  type="text"
                  value={newCategory.slug}
                  onChange={e => setNewCategory(d => ({ ...d, slug: e.target.value }))}
                  placeholder="category-slug"
                  className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </td>
              <td className="px-6 py-4">
                <input
                  type="text"
                  value={newCategory.description}
                  onChange={e => setNewCategory(d => ({ ...d, description: e.target.value }))}
                  placeholder="Description (optional)"
                  className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">0</td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleAdd}
                    disabled={isSubmitting}
                    className="p-1 text-green-600 hover:text-green-700"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add button */}
      {!isAdding && (
        <div className="border-t border-border p-4">
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      )}
    </div>
  )
}
