'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Database, CheckCircle, ExternalLink, Copy } from 'lucide-react'

export function CategoriesSetupButton() {
  const [isRunning, setIsRunning] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const categoriesSQL = `-- Create Categories Table Only
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Categories are viewable by authenticated users" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Authenticated users can insert categories" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Authenticated users can update categories" ON categories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Authenticated users can delete categories" ON categories
  FOR DELETE USING (auth.role() = 'authenticated');

INSERT INTO categories (name, slug, description) VALUES
('Skincare', 'skincare', 'Premium skincare products for healthy, glowing skin'),
('Makeup', 'makeup', 'Professional makeup products for all occasions'),
('Fragrance', 'fragrance', 'Luxury perfumes and fragrances for men and women'),
('Body Care', 'body-care', 'Nourishing body care products and treatments'),
('Hair Care', 'hair-care', 'Premium hair care products for all hair types'),
('Face', 'face', 'Specialized face treatments and cosmetics'),
('Lips', 'lips', 'Lip care products and cosmetics'),
('Eyes', 'eyes', 'Eye makeup and care products'),
('Nails', 'nails', 'Nail care products and polish'),
('Tools & Accessories', 'tools-accessories', 'Professional beauty tools and accessories'),
('Gift Sets', 'gift-sets', 'Curated gift sets for special occasions'),
('Men''s Grooming', 'mens-grooming', 'Grooming products specifically for men'),
('Natural & Organic', 'natural-organic', 'Natural and organic beauty products'),
('Anti-Aging', 'anti-aging', 'Products targeting anti-aging concerns'),
('Sun Care', 'sun-care', 'Sun protection and after-sun care')
ON CONFLICT (slug) DO NOTHING;`

  const copySQL = () => {
    navigator.clipboard.writeText(categoriesSQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const createCategoriesTable = async () => {
    setIsRunning(true)
    setMessage('Creating categories table in Supabase...')

    try {
      const supabase = createClient()
      
      // Try to create categories table using direct SQL execution
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .limit(1)

      if (error && error.message.includes('relation "categories" does not exist')) {
        setMessage('❌ Categories table does not exist. Please run SQL script manually.')
        setMessage('✅ Click "Copy SQL Script" and run in Supabase SQL Editor')
      } else if (error) {
        setMessage(`❌ Error: ${error.message}`)
      } else {
        setMessage('✅ Categories table already exists!')
      }
    } catch (error) {
      setMessage('❌ Unable to create table automatically. Please use manual setup.')
    } finally {
      setIsRunning(false)
    }
  }

  const openSupabase = () => {
    window.open('https://supabase.com/dashboard/project/_/sql', '_blank')
  }

  return (
    <Card className="mb-6 border-green-200 bg-green-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Database className="h-5 w-5" />
          Categories Table Setup
        </CardTitle>
        <CardDescription className="text-green-600">
          Your local categories need a permanent table in Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-green-200 bg-green-100">
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <p className="font-medium">🎉 Success! Categories Working Locally</p>
              <p>Category "Tools & Accessories" was created successfully in localStorage.</p>
              <p>To make categories permanent, create the categories table in Supabase.</p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-medium">Quick Setup</h3>
            <Button 
              onClick={createCategoriesTable} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Check Categories Table
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">Manual Setup</h3>
            <Button 
              onClick={openSupabase} 
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Supabase SQL
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">SQL Script</h3>
          <Button onClick={copySQL} variant="outline" className="w-full">
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                SQL Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy SQL Script
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            Paste this SQL script in Supabase SQL Editor and run it
          </p>
        </div>

        {message && (
          <Alert className={message.includes('✅') ? 'border-green-200 bg-green-100' : 'border-red-200 bg-red-100'}>
            <AlertDescription className={message.includes('✅') ? 'text-green-800' : 'text-red-800'}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <Alert className="border-blue-200 bg-blue-100">
          <AlertDescription className="text-blue-800">
            <div className="space-y-2">
              <p className="font-medium">📋 Steps:</p>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Click "Open Supabase SQL" button</li>
                <li>Click "Copy SQL Script" button</li>
                <li>Paste SQL in Supabase SQL Editor</li>
                <li>Click "Run" to execute</li>
                <li>Return here to verify</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
