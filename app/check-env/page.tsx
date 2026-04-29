'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle, Info, ExternalLink } from 'lucide-react'

interface EnvStatus {
  supabaseUrl: boolean
  supabaseAnonKey: boolean
  allPresent: boolean
  details: {
    supabaseUrl: string | null
    supabaseAnonKey: string | null
  }
}

export default function EnvCheckPage() {
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check environment variables on client side
    const checkEnv = () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const status: EnvStatus = {
        supabaseUrl: !!supabaseUrl && supabaseUrl !== 'your_supabase_project_url',
        supabaseAnonKey: !!supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key',
        allPresent: false,
        details: {
          supabaseUrl: supabaseUrl || null,
          supabaseAnonKey: supabaseAnonKey || null
        }
      }

      status.allPresent = status.supabaseUrl && status.supabaseAnonKey

      setEnvStatus(status)
      setIsLoading(false)
    }

    checkEnv()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking environment configuration...</p>
        </div>
      </div>
    )
  }

  if (!envStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unable to Check Environment</AlertTitle>
          <AlertDescription>
            Could not verify environment variables. Please check your deployment configuration.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Environment Configuration Check
          </h1>
          <p className="text-muted-foreground">
            Verify your Supabase environment variables are properly configured
          </p>
        </div>

        {/* Overall Status */}
        <Alert className={`mb-8 ${envStatus.allPresent ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          {envStatus.allPresent ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertTitle className={envStatus.allPresent ? 'text-green-800' : 'text-red-800'}>
            {envStatus.allPresent ? '✅ Environment Configured Correctly' : '❌ Environment Configuration Issues'}
          </AlertTitle>
          <AlertDescription className={envStatus.allPresent ? 'text-green-700' : 'text-red-700'}>
            {envStatus.allPresent 
              ? 'All required environment variables are present and configured correctly.'
              : 'Some environment variables are missing or incorrectly configured.'}
          </AlertDescription>
        </Alert>

        {/* Detailed Status */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Supabase URL
                <Badge variant={envStatus.supabaseUrl ? 'default' : 'destructive'}>
                  {envStatus.supabaseUrl ? 'Configured' : 'Missing'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Your Supabase project URL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {envStatus.supabaseUrl ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {envStatus.supabaseUrl ? 'Present' : 'Missing or invalid'}
                  </span>
                </div>
                {envStatus.details.supabaseUrl && (
                  <div className="p-2 bg-muted rounded text-xs font-mono break-all">
                    {envStatus.details.supabaseUrl}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Supabase Anon Key
                <Badge variant={envStatus.supabaseAnonKey ? 'default' : 'destructive'}>
                  {envStatus.supabaseAnonKey ? 'Configured' : 'Missing'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Your Supabase anonymous key
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {envStatus.supabaseAnonKey ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {envStatus.supabaseAnonKey ? 'Present' : 'Missing or invalid'}
                  </span>
                </div>
                {envStatus.details.supabaseAnonKey && (
                  <div className="p-2 bg-muted rounded text-xs font-mono break-all">
                    {envStatus.details.supabaseAnonKey.substring(0, 20)}...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Setup Instructions */}
        {!envStatus.allPresent && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Setup Instructions
              </CardTitle>
              <CardDescription>
                Follow these steps to configure your environment variables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Get Supabase Credentials</h4>
                    <p className="text-sm text-muted-foreground">
                      Go to your{' '}
                      <a 
                        href="https://supabase.com/dashboard" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Supabase Dashboard
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      {' '}and navigate to Project Settings → API
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Copy Environment Variables</h4>
                    <p className="text-sm text-muted-foreground">
                      Copy the Project URL and Anon Public Key from your Supabase project settings
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Configure Your Hosting Platform</h4>
                    <p className="text-sm text-muted-foreground">
                      Add the following environment variables to your hosting platform (Vercel, Netlify, etc.):
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded text-sm">
                      <code>NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url</code>
                      <br />
                      <code>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key</code>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Redeploy Your Application</h4>
                    <p className="text-sm text-muted-foreground">
                      After adding the environment variables, redeploy your application to apply the changes
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Platform Specific Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Platform-Specific Instructions</CardTitle>
            <CardDescription>
              How to set environment variables on popular hosting platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Vercel</h4>
              <p className="text-sm text-muted-foreground">
                Go to Project Settings → Environment Variables and add your Supabase credentials.
                Make sure to redeploy after adding variables.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Netlify</h4>
              <p className="text-sm text-muted-foreground">
                Go to Site settings → Build & deploy → Environment → Environment variables
                and add your Supabase credentials.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Railway</h4>
              <p className="text-sm text-muted-foreground">
                Go to your project settings → Variables and add your Supabase credentials.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">DigitalOcean App Platform</h4>
              <p className="text-sm text-muted-foreground">
                Go to your app settings → Components → Environment variables and add your Supabase credentials.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Debug Information</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 text-sm">
              <p><strong>Current Status:</strong> {envStatus.allPresent ? 'Configured' : 'Not Configured'}</p>
              <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
              <p><strong>URL Check:</strong> {envStatus.supabaseUrl ? 'Pass' : 'Fail'}</p>
              <p><strong>Key Check:</strong> {envStatus.supabaseAnonKey ? 'Pass' : 'Fail'}</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
