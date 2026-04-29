'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Database, CheckCircle, XCircle } from 'lucide-react'

interface TableResult {
  exists: boolean
  count: number
  error?: string
}

export function DatabaseCheck() {
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState<{
    categories: TableResult
    products: TableResult
  } | null>(null)

  const checkDatabase = async () => {
    setIsChecking(true)
    setResults(null)

    try {
      const supabase = createClient()
      
      // Check categories table
      let categoriesResult: TableResult = { exists: false, count: 0 }
      try {
        const { data, error, count } = await supabase
          .from('categories')
          .select('*', { count: 'exact' })
        
        if (error) {
          categoriesResult = { exists: false, count: 0, error: error.message }
        } else {
          categoriesResult = { exists: true, count: count || 0 }
        }
      } catch (err) {
        categoriesResult = { exists: false, count: 0, error: 'Table does not exist' }
      }

      // Check products table
      let productsResult: TableResult = { exists: false, count: 0 }
      try {
        const { data, error, count } = await supabase
          .from('products')
          .select('*', { count: 'exact' })
        
        if (error) {
          productsResult = { exists: false, count: 0, error: error.message }
        } else {
          productsResult = { exists: true, count: count || 0 }
        }
      } catch (err) {
        productsResult = { exists: false, count: 0, error: 'Table does not exist' }
      }

      setResults({
        categories: categoriesResult,
        products: productsResult
      })
    } catch (error) {
      console.error('Database check failed:', error)
      setResults({
        categories: { exists: false, count: 0, error: 'Connection failed' },
        products: { exists: false, count: 0, error: 'Connection failed' }
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Status Check
        </CardTitle>
        <CardDescription>
          Check if your database tables are properly set up
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={checkDatabase} disabled={isChecking}>
          {isChecking ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            'Check Database Status'
          )}
        </Button>

        {results && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                {results.categories.exists ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">Categories Table</span>
              </div>
              <div className="text-sm text-right">
                {results.categories.exists ? (
                  <span className="text-green-600">
                    {results.categories.count} items
                  </span>
                ) : (
                  <span className="text-red-600">
                    {results.categories.error || 'Not found'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                {results.products.exists ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">Products Table</span>
              </div>
              <div className="text-sm text-right">
                {results.products.exists ? (
                  <span className="text-green-600">
                    {results.products.count} items
                  </span>
                ) : (
                  <span className="text-red-600">
                    {results.products.error || 'Not found'}
                  </span>
                )}
              </div>
            </div>

            {(!results.categories.exists || !results.products.exists) && (
              <Alert>
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Database Setup Required:</p>
                    <ol className="text-sm space-y-1 list-decimal list-inside">
                      <li>Go to Supabase Dashboard → SQL Editor</li>
                      <li>Run the contents of <code className="bg-muted px-1 rounded">create-categories-table.sql</code></li>
                      <li>Run the contents of <code className="bg-muted px-1 rounded">create-products-table.sql</code></li>
                      <li>Click "Check Database Status" again to verify</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {results.categories.exists && results.products.exists && (
              <Alert>
                <AlertDescription className="text-green-600">
                  ✅ Database is properly set up! You can now create products and categories.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
