import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During prerendering/build time, environment variables might not be available
  // Only throw error in development, not during build
  if (!supabaseUrl || !supabaseAnonKey) {
    // Only log error in development, not during build
    if (process.env.NODE_ENV === 'development') {
      console.error('Missing Supabase environment variables:', {
        url: !!supabaseUrl,
        key: !!supabaseAnonKey
      })
      throw new Error('Supabase configuration is missing. Please check your environment variables.')
    }
    
    // During build, return a minimal mock that won't break the build
    return createMockClient()
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Minimal mock client for build time only
function createMockClient() {
  return new Proxy({}, {
    get: () => {
      // Return a function that returns a promise with mock data
      return () => Promise.resolve({ data: null, error: null })
    }
  }) as any
}
