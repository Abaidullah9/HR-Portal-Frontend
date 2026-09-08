'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <SectionHeader title="Settings" description="Manage your organization and preferences" />

        {/* Organization Settings */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Organization</h3>
            <div className="space-y-4 bg-card border border-border rounded-lg p-6">
              <div>
                <label className="text-sm font-medium">Organization Name</label>
                <Input defaultValue="Acme Corporation" className="mt-2" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input defaultValue="admin@acme.com" type="email" className="mt-2" />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input defaultValue="+1 (555) 123-4567" className="mt-2" />
              </div>
              <div className="pt-4">
                <Button>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Notifications</h3>
            <div className="space-y-4 bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email updates</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <hr className="border-border" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Leave Requests</p>
                  <p className="text-sm text-muted-foreground">Get notified about leave requests</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <hr className="border-border" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payroll Updates</p>
                  <p className="text-sm text-muted-foreground">Get payroll processing notifications</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* User Preferences */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Preferences</h3>
            <div className="space-y-4 bg-card border border-border rounded-lg p-6">
              <div>
                <label className="text-sm font-medium">Language</label>
                <select className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-background">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Time Zone</label>
                <select className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-background">
                  <option>UTC-8 (Pacific Time)</option>
                  <option>UTC-5 (Eastern Time)</option>
                  <option>UTC (GMT)</option>
                </select>
              </div>
              <div className="pt-4">
                <Button>Save Preferences</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-destructive">Danger Zone</h3>
            <div className="space-y-4 bg-destructive/5 border border-destructive/20 rounded-lg p-6">
              <div>
                <p className="font-medium">Delete Organization</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This action cannot be undone. Please be certain.
                </p>
                <Button variant="destructive" className="mt-4">
                  Delete Organization
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
