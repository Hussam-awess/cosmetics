'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import { AuthModal } from '@/components/auth/auth-modal'
import { UserProfile } from '@/components/auth/user-profile'
import { CartDrawer } from '@/components/store/cart-drawer'

export function ButtonTest() {
  const { user, isLoading } = useAuth()
  const { addItem, itemCount, isOpen, setIsOpen, items, subtotal, removeItem, updateQuantity } = useCart()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testProduct = {
    id: 'test-123',
    name: 'Test Product',
    price: 50000,
    stock: 10,
    slug: 'test-product',
    description: 'Test product for button testing',
    compare_at_price: null,
    category_id: null,
    image_url: null,
    featured: false,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const testProductOutOfStock = {
    ...testProduct,
    id: 'test-out-of-stock',
    name: 'Out of Stock Product',
    stock: 0
  }

  const testProductLowStock = {
    ...testProduct,
    id: 'test-low-stock',
    name: 'Low Stock Product',
    stock: 2
  }

  const testButtons = () => {
    // Test auth modal button
    addTestResult('✓ Auth modal button works')
    
    // Test user state
    addTestResult(`✓ User state: ${user ? 'Logged in' : 'Not logged in'}`)
    
    // Test 1: Add to cart when not logged in
    if (!user) {
      try {
        addItem(testProduct)
        addTestResult('✗ Should have failed to add to cart when not logged in')
      } catch (error) {
        addTestResult('✓ Correctly prevented adding to cart when not logged in')
      }
    } else {
      // Test 2: Add to cart when logged in
      try {
        addItem(testProduct)
        addTestResult('✓ Successfully added product to cart when logged in')
      } catch (error) {
        addTestResult(`✗ Failed to add to cart when logged in: ${error}`)
      }
      
      // Test 3: Add out of stock product
      try {
        addItem(testProductOutOfStock)
        addTestResult('✗ Should have failed to add out of stock product')
      } catch (error) {
        addTestResult('✓ Correctly prevented adding out of stock product')
      }
      
      // Test 4: Add low stock product
      try {
        addItem(testProductLowStock)
        addTestResult('✓ Successfully added low stock product')
      } catch (error) {
        addTestResult(`✗ Failed to add low stock product: ${error}`)
      }
      
      // Test 5: Add same product twice (should increase quantity)
      try {
        addItem(testProduct)
        addItem(testProduct)
        addTestResult('✓ Successfully added same product twice')
      } catch (error) {
        addTestResult(`✗ Failed to add same product twice: ${error}`)
      }
    }
    
    addTestResult(`✓ Cart items count: ${itemCount}`)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Button Functionality Test</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Test Buttons:</h3>
        
        {/* Test Auth Modal */}
        <Button onClick={() => setShowAuthModal(true)}>
          Open Auth Modal
        </Button>
        
        <div className="space-y-2">
          <h4 className="font-medium">Cart Tests:</h4>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => addItem(testProduct)}>
              Add Normal Product
            </Button>
            <Button onClick={() => addItem(testProductOutOfStock)} variant="outline">
              Add Out of Stock
            </Button>
            <Button onClick={() => addItem(testProductLowStock)} variant="outline">
              Add Low Stock
            </Button>
          </div>
        </div>
        
        {/* Test All Buttons */}
        <Button onClick={testButtons} variant="outline">
          Run All Tests
        </Button>
        
        <div className="space-y-2">
          <h4 className="font-medium">Cart Drawer Tests:</h4>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setIsOpen(true)} variant="outline">
              Open Cart Drawer
            </Button>
            <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm">
              Close Cart Drawer
            </Button>
            <Button onClick={() => {
              if (items.length > 0) {
                removeItem(items[0].product.id)
                addTestResult('✓ Removed item from cart')
              } else {
                addTestResult('✗ No items to remove')
              }
            }} variant="outline" size="sm">
              Remove First Item
            </Button>
          </div>
        </div>
        
        {/* Clear Test Results */}
        <Button onClick={() => setTestResults([])} variant="ghost">
          Clear Results
        </Button>
        
        {/* Show User Profile if logged in */}
        {user && <UserProfile />}
        
        {/* Cart Status */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Cart Status:</h4>
          <div className="text-sm space-y-1">
            <p>Items: {itemCount}</p>
            <p>Subtotal: TZS {subtotal.toLocaleString()}</p>
            <p>Drawer Open: {isOpen ? 'Yes' : 'No'}</p>
            <p>Products: {items.map(item => item.product.name).join(', ') || 'None'}</p>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Test Results:</h3>
          <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        message="Testing auth modal functionality"
      />
      
      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  )
}
