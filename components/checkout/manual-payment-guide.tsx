'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Smartphone, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react'

interface ManualPaymentGuideProps {
  paymentMethod: 'mpesa' | 'tigopesa'
  amount: number
  onPaymentConfirmed: () => void
}

export function ManualPaymentGuide({ paymentMethod, amount, onPaymentConfirmed }: ManualPaymentGuideProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const phoneNumber = paymentMethod === 'mpesa' ? '+255 765 123 456' : '+255 713 123 456'
  const businessName = 'Niffer Cosmetics'

  const mpesaSteps = [
    {
      step: 1,
      title: 'Open M-Pesa',
      description: 'Go to your M-Pesa menu on your phone',
      icon: <Smartphone className="h-5 w-5" />
    },
    {
      step: 2,
      title: 'Select Lipa na M-Pesa',
      description: 'Choose "Lipa na M-Pesa" from the menu',
      icon: <Smartphone className="h-5 w-5" />
    },
    {
      step: 3,
      title: 'Select Pay Bill',
      description: 'Choose "Pay Bill" option',
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      step: 4,
      title: 'Enter Business Number',
      description: 'Enter business number: <strong>123456</strong>',
      icon: <Copy className="h-5 w-5" />
    },
    {
      step: 5,
      title: 'Enter Account Number',
      description: 'Enter your order number as reference',
      icon: <Copy className="h-5 w-5" />
    },
    {
      step: 6,
      title: 'Enter Amount',
      description: `Enter amount: <strong>${amount.toLocaleString()} TZS</strong>`,
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      step: 7,
      title: 'Enter M-Pesa PIN',
      description: 'Enter your M-Pesa PIN to confirm',
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      step: 8,
      title: 'Confirm Payment',
      description: 'Verify details and complete payment',
      icon: <CheckCircle className="h-5 w-5" />
    }
  ]

  const tigoPesaSteps = [
    {
      step: 1,
      title: 'Open Tigo Pesa',
      description: 'Go to your Tigo Pesa menu on your phone',
      icon: <Smartphone className="h-5 w-5" />
    },
    {
      step: 2,
      title: 'Select Send Money',
      description: 'Choose "Send Money" from the menu',
      icon: <Smartphone className="h-5 w-5" />
    },
    {
      step: 3,
      title: 'Enter Phone Number',
      description: `Enter our number: <strong>${phoneNumber}</strong>`,
      icon: <Copy className="h-5 w-5" />
    },
    {
      step: 4,
      title: 'Enter Amount',
      description: `Enter amount: <strong>${amount.toLocaleString()} TZS</strong>`,
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      step: 5,
      title: 'Enter Reference',
      description: 'Enter your order number as reference',
      icon: <Copy className="h-5 w-5" />
    },
    {
      step: 6,
      title: 'Enter PIN',
      description: 'Enter your Tigo Pesa PIN to confirm',
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      step: 7,
      title: 'Confirm Payment',
      description: 'Verify details and complete payment',
      icon: <CheckCircle className="h-5 w-5" />
    }
  ]

  const steps = paymentMethod === 'mpesa' ? mpesaSteps : tigoPesaSteps

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const PaymentSteps = () => (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Please complete the payment before placing your order. 
          Keep your transaction confirmation message for reference.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">Payment Amount</p>
            <p className="text-sm text-muted-foreground">Total to pay</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{amount.toLocaleString()} TZS</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">{paymentMethod === 'mpesa' ? 'Business Number' : 'Phone Number'}</p>
            <p className="text-sm text-muted-foreground">{paymentMethod === 'mpesa' ? 'M-Pesa Pay Bill' : 'Tigo Pesa Send Money'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono">{paymentMethod === 'mpesa' ? '123456' : phoneNumber}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(paymentMethod === 'mpesa' ? '123456' : phoneNumber)}
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">Business Name</p>
            <p className="text-sm text-muted-foreground">Payment recipient</p>
          </div>
          <span className="font-medium">{businessName}</span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Step-by-Step Instructions</h3>
        <div className="space-y-3">
          {steps.map((stepItem, index) => (
            <div key={index} className="flex gap-3 p-3 border rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                {stepItem.step}
              </div>
              <div className="flex-1">
                <h4 className="font-medium flex items-center gap-2">
                  {stepItem.icon}
                  {stepItem.title}
                </h4>
                <p 
                  className="text-sm text-muted-foreground mt-1"
                  dangerouslySetInnerHTML={{ __html: stepItem.description }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="space-y-2">
            <p className="font-medium">After Payment:</p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Save the transaction confirmation message</li>
              <li>Return to this checkout page</li>
              <li>Click "I've Paid - Place Order" below</li>
              <li>Your order will be processed and shipped</li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>

      <div className="flex gap-3 pt-4">
        <Button 
          onClick={onPaymentConfirmed}
          className="flex-1"
          size="lg"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          I've Paid - Place Order
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setIsOpen(false)}
          size="lg"
        >
          Cancel
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button"
          variant="outline" 
          className="w-full"
          size="lg"
        >
          <Smartphone className="h-4 w-4 mr-2" />
          View {paymentMethod === 'mpesa' ? 'M-Pesa' : 'Tigo Pesa'} Payment Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            {paymentMethod === 'mpesa' ? 'M-Pesa' : 'Tigo Pesa'} Payment Guide
          </DialogTitle>
          <DialogDescription>
            Follow these step-by-step instructions to complete your payment of {amount.toLocaleString()} TZS
          </DialogDescription>
        </DialogHeader>
        <PaymentSteps />
      </DialogContent>
    </Dialog>
  )
}
