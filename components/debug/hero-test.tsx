'use client'

import { useRouter } from 'next/navigation'

export function HeroTestButtons() {
  const router = useRouter()

  const testShopNow = () => {
    console.log('Testing Shop Now button...')
    try {
      router.push('/shop')
      console.log('✓ Shop navigation successful')
    } catch (error) {
      console.error('✗ Shop navigation failed:', error)
      window.location.href = '/shop'
    }
  }

  const testExploreSkincare = () => {
    console.log('Testing Explore Skincare button...')
    try {
      router.push('/shop?category=skincare')
      console.log('✓ Skincare navigation successful')
    } catch (error) {
      console.error('✗ Skincare navigation failed:', error)
      window.location.href = '/shop?category=skincare'
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Hero Button Test</h2>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Test the original buttons:</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={testShopNow}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Shop Now (Test)
          </button>
          <button
            onClick={testExploreSkincare}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-8 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Explore Skincare (Test)
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Direct links (fallback test):</h3>
        <div className="flex flex-wrap gap-4">
          <a
            href="/shop"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Direct Shop Link
          </a>
          <a
            href="/shop?category=skincare"
            className="inline-flex items-center justify-center rounded-lg border border-blue-600 bg-white px-8 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            Direct Skincare Link
          </a>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-medium mb-2">Instructions:</h4>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>Open browser console (F12)</li>
          <li>Click each button above</li>
          <li>Check console for success/error messages</li>
          <li>Verify navigation works correctly</li>
        </ol>
      </div>
    </div>
  )
}
