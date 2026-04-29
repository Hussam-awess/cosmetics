import { AuthFallback } from '@/components/debug/auth-fallback'

export default function AuthHelpPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <AuthFallback />
    </div>
  )
}
