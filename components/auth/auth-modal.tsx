'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
}

export function AuthModal({ isOpen, onClose, message }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  
  // Validate environment variables and create client
  let supabase: ReturnType<typeof createClient>
  let configError: string | null = null
  
  try {
    supabase = createClient()
  } catch (err) {
    console.error('Supabase client initialization error:', err)
    configError = 'Authentication service is not properly configured. Please check your environment variables.'
  }

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setError(null)
      setSuccess(null)
    }
  }, [isOpen])

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      if (!email || !password) {
        setError('Please fill in all fields')
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Signin error:', error)
        setError(error.message)
      } else {
        setSuccess('Login successful!')
        
        // Check if user is admin and redirect accordingly
        if (data.user) {
          console.log('Checking admin status for user:', data.user.id)
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.user.id)
            .single()

          console.log('Profile data:', { profile, profileError })

          if (profileError) {
            console.error('Profile fetch error:', profileError)
            // If profile check fails, assume regular customer
            setTimeout(() => {
              onClose()
              // Refresh page to update auth state
              window.location.reload()
            }, 1000)
          } else if (profile?.is_admin) {
            console.log('User is admin, redirecting to dashboard')
            setTimeout(() => {
              router.push('/admin')
              onClose()
            }, 1000)
          } else {
            console.log('User is regular customer')
            setTimeout(() => {
              onClose()
              // Refresh page to update auth state
              window.location.reload()
            }, 1000)
          }
        } else {
          console.log('No user data found')
          setTimeout(() => onClose(), 1000)
        }
      }
    } catch (err) {
      console.error('Sign in error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      const name = formData.get('name') as string

      // Validate input
      if (!email || !password || !name) {
        setError('Please fill in all fields')
        setIsLoading(false)
        return
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long')
        setIsLoading(false)
        return
      }

      console.log('Attempting signup with:', { email, name })

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            full_name: name,
          }
        }
      })

      console.log('Signup result:', { error, data })

      if (error) {
        console.error('Signup error:', error)
        setError(error.message)
      } else if (data.user && !data.session) {
        setSuccess('Account created! Please check your email to verify your account.')
      } else {
        setSuccess('Account created successfully!')
        setTimeout(() => onClose(), 1000)
      }
    } catch (err) {
      console.error('Unexpected signup error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // If there's a configuration error, show a helpful message
  if (configError) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-center">
              Authentication Setup Required
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                {configError}
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">To fix this issue:</h4>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Visit <a href="/auth-help" className="text-blue-600 underline">Authentication Help</a></li>
                <li>Get your Supabase credentials from the dashboard</li>
                <li>Update your .env.local file</li>
                <li>Restart the development server</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => window.location.href = '/auth-help'} className="flex-1">
                Get Help
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            {message || 'Welcome to Niffer Cosmetics'}
          </DialogTitle>
        </DialogHeader>

        {message && (
          <Alert className="mb-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  required
                  minLength={6}
                  disabled={isLoading}
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
