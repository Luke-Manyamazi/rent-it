import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AvatarUploader } from '@/features/account/components/AvatarUploader'
import { EditProfileForm } from '@/features/account/components/EditProfileForm'
import { VerificationStatusCard } from '@/features/account/components/VerificationStatusCard'

export function AccountProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account details and verification.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AvatarUploader />
              <EditProfileForm />
            </CardContent>
          </Card>
        </div>

        <VerificationStatusCard />
      </div>
    </div>
  )
}
