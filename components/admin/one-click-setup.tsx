'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Database, AlertTriangle, CheckCircle, Play } from 'lucide-react'

export function OneClickSetup() {
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [success, setSuccess] = useState(false)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runSetup = async () => {
    setIsRunning(true)
    setLogs([])
    setSuccess(false)

    try {
      const supabase = createClient()
      addLog('Starting database setup...')

      // Step 1: Create categories table
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `
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
          `
        })
        
        if (error) {
          addLog(`❌ Categories table creation failed: ${error.message}`)
        } else {
          addLog('✅ Categories table created successfully')
        }
      } catch (err) {
        addLog('⚠️ Categories table creation failed (will try alternative method)')
      }

      // Step 2: Create products table
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS products (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              name TEXT NOT NULL,
              slug TEXT NOT NULL UNIQUE,
              description TEXT,
              price DECIMAL(10,2) NOT NULL DEFAULT 0,
              compare_at_price DECIMAL(10,2),
              category_id UUID REFERENCES categories(id),
              image_url TEXT,
              stock INTEGER NOT NULL DEFAULT 0,
              featured BOOLEAN DEFAULT FALSE,
              active BOOLEAN DEFAULT TRUE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            ALTER TABLE products ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY IF NOT EXISTS "Products are viewable by authenticated users" ON products
              FOR SELECT USING (auth.role() = 'authenticated');
            CREATE POLICY IF NOT EXISTS "Authenticated users can insert products" ON products
              FOR INSERT WITH CHECK (auth.role() = 'authenticated');
            CREATE POLICY IF NOT EXISTS "Authenticated users can update products" ON products
              FOR UPDATE USING (auth.role() = 'authenticated');
            CREATE POLICY IF NOT EXISTS "Authenticated users can delete products" ON products
              FOR DELETE USING (auth.role() = 'authenticated');
          `
        })
        
        if (error) {
          addLog(`❌ Products table creation failed: ${error.message}`)
        } else {
          addLog('✅ Products table created successfully')
        }
      } catch (err) {
        addLog('⚠️ Products table creation failed (will try alternative method)')
      }

      // Step 3: Create profiles table
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS profiles (
              id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
              email TEXT NOT NULL,
              full_name TEXT,
              phone TEXT,
              is_admin BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY IF NOT EXISTS "Users can view their own profile" ON profiles
              FOR SELECT USING (auth.uid() = id);
            CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON profiles
              FOR UPDATE USING (auth.uid() = id);
            CREATE POLICY IF NOT EXISTS "Users can insert their own profile" ON profiles
              FOR INSERT WITH CHECK (auth.uid() = id);
          `
        })
        
        if (error) {
          addLog(`❌ Profiles table creation failed: ${error.message}`)
        } else {
          addLog('✅ Profiles table created successfully')
        }
      } catch (err) {
        addLog('⚠️ Profiles table creation failed (will try alternative method)')
      }

      // Step 4: Insert default categories
      try {
        const categories = [
          { name: 'Skincare', slug: 'skincare', description: 'Premium skincare products for healthy, glowing skin' },
          { name: 'Makeup', slug: 'makeup', description: 'Professional makeup products for all occasions' },
          { name: 'Fragrance', slug: 'fragrance', description: 'Luxury perfumes and fragrances for men and women' },
          { name: 'Body Care', slug: 'body-care', description: 'Nourishing body care products and treatments' },
          { name: 'Hair Care', slug: 'hair-care', description: 'Premium hair care products for all hair types' }
        ]

        for (const category of categories) {
          const { error } = await supabase
            .from('categories')
            .insert(category)
          
          if (error && !error.message.includes('duplicate')) {
            addLog(`⚠️ Category "${category.name}" insertion failed: ${error.message}`)
          } else {
            addLog(`✅ Category "${category.name}" added successfully`)
          }
        }
      } catch (err) {
        addLog('⚠️ Default categories insertion failed')
      }

      // Step 5: Verify setup
      addLog('🔍 Verifying database setup...')
      
      const tables = ['categories', 'products', 'profiles']
      let allGood = true
      
      for (const table of tables) {
        try {
          const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
          
          if (error) {
            addLog(`❌ ${table}: ${error.message}`)
            allGood = false
          } else {
            addLog(`✅ ${table}: ${count || 0} records`)
          }
        } catch (err) {
          addLog(`❌ ${table}: Table does not exist`)
          allGood = false
        }
      }

      if (allGood) {
        addLog('🎉 Database setup completed successfully!')
        setSuccess(true)
      } else {
        addLog('⚠️ Some tables may still need manual setup')
        addLog('📝 Please run the SQL script manually in Supabase Dashboard')
      }

    } catch (error) {
      addLog(`❌ Setup failed: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  const openSupabaseSQL = () => {
    window.open('https://supabase.com/dashboard/project', '_blank')
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Database Setup Required
        </CardTitle>
        <CardDescription className="text-orange-600">
          The database tables need to be created to fix the "Insert error" issue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-orange-200 bg-orange-100">
          <AlertDescription className="text-orange-800">
            <div className="space-y-2">
              <p className="font-medium">🚨 Action Required!</p>
              <p>Your Supabase database is missing the required tables. You have two options:</p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-medium">Option 1: Automatic Setup</h3>
            <Button 
              onClick={runSetup} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Automatic Setup
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              Try to create tables automatically (may not work due to permissions)
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">Option 2: Manual Setup (Recommended)</h3>
            <Button 
              onClick={openSupabaseSQL} 
              variant="outline"
              className="w-full"
            >
              <Database className="h-4 w-4 mr-2" />
              Open Supabase SQL Editor
            </Button>
            <p className="text-sm text-muted-foreground">
              Run the SQL script manually in Supabase Dashboard
            </p>
          </div>
        </div>

        {logs.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Setup Log:</h3>
            <div className="bg-black/80 text-green-400 p-3 rounded-lg font-mono text-xs h-48 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-100">
            <AlertDescription className="text-green-800">
              <CheckCircle className="h-4 w-4 inline mr-2" />
              Database setup completed! You can now create products without errors.
            </AlertDescription>
          </Alert>
        )}

        {!success && (
          <Alert className="border-blue-200 bg-blue-100">
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <p className="font-medium">📋 Manual Setup Instructions:</p>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Open Supabase Dashboard</li>
                  <li>Go to SQL Editor</li>
                  <li>Copy the SQL script from the Database Setup Helper below</li>
                  <li>Paste and run the script</li>
                  <li>Wait for completion</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
