'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Search, Shield, User, Mail, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  is_admin: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
      setMessage({ type: 'error', text: 'Failed to fetch users' })
    } finally {
      setLoading(false)
    }
  }

  const toggleAdminStatus = async (profileId: string, currentStatus: boolean) => {
    setUpdatingId(profileId)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', profileId)

      if (error) throw error

      // Update local state
      setProfiles(prev => 
        prev.map(profile => 
          profile.id === profileId 
            ? { ...profile, is_admin: !currentStatus }
            : profile
        )
      )

      setMessage({ 
        type: 'success', 
        text: `Admin status ${!currentStatus ? 'granted' : 'revoked'} successfully` 
      })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update admin status' })
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredProfiles = profiles.filter(profile =>
    profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts and admin permissions
        </p>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="search">Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredProfiles.map((profile) => (
          <Card key={profile.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">
                        {profile.full_name || 'No name'}
                      </p>
                      {profile.is_admin && (
                        <Badge variant="default" className="text-xs">
                          <Shield className="mr-1 h-3 w-3" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{profile.email}</span>
                      </div>
                      {profile.phone && (
                        <div className="flex items-center space-x-1">
                          <span>{profile.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(profile.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={profile.is_admin ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleAdminStatus(profile.id, profile.is_admin)}
                    disabled={updatingId === profile.id}
                  >
                    {updatingId === profile.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : profile.is_admin ? (
                      'Revoke Admin'
                    ) : (
                      'Make Admin'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredProfiles.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm ? 'Try adjusting your search terms.' : 'No users have registered yet.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to Assign Admin Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
            <li>Find the user you want to make admin in the list above</li>
            <li>Click the "Make Admin" button next to their profile</li>
            <li>The user will immediately have admin access to the dashboard</li>
            <li>To revoke admin access, click "Revoke Admin" on an admin user</li>
          </ol>
          <Alert>
            <AlertDescription>
              <strong>Important:</strong> Only grant admin access to trusted users. Admins can manage all products, orders, and categories.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
