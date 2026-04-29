'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthFallback() {
  const [testResult, setTestResult] = useState<string | null>(null)

  const testSupabaseConnection = async () => {
    try {
      // Test if environment variables are available
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        setTestResult('❌ Environment variables are missing!\n\nPlease update your .env.local file with:\nNEXT_PUBLIC_SUPABASE_URL=your_supabase_url\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
        return
      }

      // Test URL format
      if (!supabaseUrl.startsWith('http')) {
        setTestResult('❌ Invalid URL format!\n\nYour URL should start with https://')
        return
      }

      // Test key format
      if (supabaseAnonKey.length < 20) {
        setTestResult('❌ Invalid key format!\n\nYour anon key seems too short.')
        return
      }

      // Try to create a test client
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Test a simple operation
      const { data, error } = await supabase.from('profiles').select('count').limit(1)

      if (error) {
        setTestResult(`❌ Supabase connection failed!\n\nError: ${error.message}\n\nThis could be due to:\n- Wrong URL or key\n- Network issues\n- Supabase project not found`)
      } else {
        setTestResult('✅ Supabase connection successful!\n\nYour environment variables are correctly configured.')
      }
    } catch (error) {
      setTestResult(`❌ Critical error!\n\n${error}\n\nPlease check your environment variables and restart the server.`)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Authentication Troubleshooting</CardTitle>
        <CardDescription>
          Diagnose and fix Supabase connection issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testSupabaseConnection} className="w-full">
          Test Supabase Connection
        </Button>

        {testResult && (
          <Alert>
            <AlertDescription className="whitespace-pre-line">
              {testResult}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Quick Fix Steps:</h4>
          <ol className="text-sm space-y-2 list-decimal list-inside">
            <li>
              <strong>Get your Supabase credentials:</strong>
              <ul className="ml-4 mt-1 list-disc">
                <li>Go to <a href="https://supabase.com/dashboard" target="_blank" className="text-blue-600 underline">supabase.com/dashboard</a></li>
                <li>Select your project or create a new one</li>
                <li>Go to Settings → API</li>
                <li>Copy the Project URL and Anon/Public Key</li>
              </ul>
            </li>
            <li>
              <strong>Update .env.local file:</strong>
              <pre className="bg-background p-2 rounded mt-2 text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
              </pre>
            </li>
            <li>
              <strong>Restart the server:</strong>
              <pre className="bg-background p-2 rounded mt-2 text-xs">
{`# Stop server (Ctrl+C)
npm run dev`}
              </pre>
            </li>
          </ol>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">⚠️ Important Notes:</h4>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>The .env.local file should be in the root of your project</li>
            <li>Never commit .env.local to git (it's already in .gitignore)</li>
            <li>Environment variables must start with NEXT_PUBLIC_ for client-side access</li>
            <li>Restart the server after changing environment variables</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
