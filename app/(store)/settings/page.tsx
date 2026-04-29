'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, User, Mail, Bell, Shield, Trash2, Download, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const supabase = createClient()

  const [preferences, setPreferences] = useState({
    email_notifications: true,
    marketing_emails: true,
    order_updates: true,
    newsletter: false,
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const currentPassword = formData.get('current_password') as string
    const newPassword = formData.get('new_password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Password updated successfully!' })
        e.currentTarget.reset()
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password' })
    }

    setIsLoading(false)
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    setMessage(null)

    try {
      // Delete user profile
      if (user) {
        await supabase.from('profiles').delete().eq('id', user.id)
        
        // Delete user auth account
        const { error } = await supabase.auth.admin.deleteUser(user.id)
        
        if (error) {
          // If admin delete fails, try regular sign out
          await signOut()
          setMessage({ type: 'success', text: 'Account deletion initiated. You will be logged out.' })
        } else {
          setMessage({ type: 'success', text: 'Account deleted successfully!' })
        }
      }
      
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete account. Please contact support.' })
    }

    setDeleteLoading(false)
    setDeleteDialogOpen(false)
  }

  const handleExportData = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      if (!user) return

      // Get user's orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', user.email)

      // Get user's profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const exportData = {
        profile: userProfile,
        orders: orders || [],
        export_date: new Date().toISOString(),
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `niffer-cosmetics-data-${user.email}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setMessage({ type: 'success', text: 'Your data has been exported successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data' })
    }

    setIsLoading(false)
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertDescription>Please login to view your settings.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account preferences, security, and data
          </p>
          <div className="mt-2">
            <span className="text-sm text-muted-foreground">
              For personal information updates, visit your{' '}
              <a href="/profile" className="text-primary hover:underline">
                profile page
              </a>
            </span>
          </div>
        </div>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        
        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Change your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input
                    id="current_password"
                    name="current_password"
                    type="password"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    name="new_password"
                    type="password"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" variant="outline" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Manage how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive order updates and important information via email
                </p>
              </div>
              <Switch
                checked={preferences.email_notifications}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, email_notifications: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive promotions and special offers
                </p>
              </div>
              <Switch
                checked={preferences.marketing_emails}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, marketing_emails: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Newsletter</Label>
                <p className="text-sm text-muted-foreground">
                  Subscribe to our weekly newsletter
                </p>
              </div>
              <Switch
                checked={preferences.newsletter}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, newsletter: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>
              Manage your account data and access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Export Your Data</h4>
                <p className="text-sm text-muted-foreground">
                  Download all your account information and order history
                </p>
              </div>
              <Button onClick={handleExportData} variant="outline" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Sign Out</h4>
                <p className="text-sm text-muted-foreground">
                  Sign out of your account on this device
                </p>
              </div>
              <Button onClick={signOut} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-destructive">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        <strong>This will delete:</strong>
                        <ul className="list-disc list-inside mt-2">
                          <li>Your profile information</li>
                          <li>All your order history</li>
                          <li>Your saved preferences</li>
                          <li>Your authentication credentials</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-delete">Type "DELETE" to confirm</Label>
                      <Input
                        id="confirm-delete"
                        placeholder="DELETE"
                        onChange={(e) => {
                          if (e.target.value === 'DELETE') {
                            // Enable delete button
                          }
                        }}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                      disabled={deleteLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Delete Account'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Type</span>
                <Badge variant={profile.is_admin ? 'default' : 'secondary'}>
                  {profile.is_admin ? 'Administrator' : 'Customer'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Member Since</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Status</span>
                <Badge variant="outline">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
