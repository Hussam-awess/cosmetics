'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function EnvironmentCheck() {
  const [checkResult, setCheckResult] = useState<string | null>(null)

  const checkEnvironment = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const results = [
      `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`,
      `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`,
      `URL Format: ${supabaseUrl && (supabaseUrl.startsWith('http') || supabaseUrl.startsWith('https')) ? '✅ Valid' : '❌ Invalid'}`,
      `Key Length: ${supabaseAnonKey ? (supabaseAnonKey.length > 20 ? '✅ Valid length' : '❌ Too short') : '❌ Missing'}`
    ]

    if (supabaseUrl && supabaseAnonKey) {
      results.push('🎉 Environment variables appear to be correctly configured!')
    } else {
      results.push('⚠️ Please check your .env.local file and ensure both variables are set.')
    }

    setCheckResult(results.join('\n'))

    // Log to console for debugging
    console.log('Environment Check Results:', results)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Environment Variable Check</h2>
      
      <div className="space-y-4">
        <Button onClick={checkEnvironment}>
          Check Environment Variables
        </Button>

        {checkResult && (
          <Alert>
            <AlertDescription className="whitespace-pre-line font-mono text-sm">
              {checkResult}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">How to Fix:</h3>
          <ol className="text-sm space-y-2 list-decimal list-inside">
            <li>Open your <code className="bg-background px-1 rounded">.env.local</code> file</li>
            <li>Add your Supabase URL and Anon Key</li>
            <li>Make sure the format is exactly like this:</li>
            <pre className="bg-background p-2 rounded mt-2 text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`}
            </pre>
            <li>Restart the development server</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
