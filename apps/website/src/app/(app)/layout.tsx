import { AppHeader } from "@/components/AppHeader"
import { AppFooter } from "@/components/AppFooter"
import { ContributionPrompt } from "@/components/ContributionPrompt"
import { getProfileAvatar } from "@/lib/profile-server"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const avatarUrl = await getProfileAvatar()

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <AppHeader initialAvatarUrl={avatarUrl} />
      <main className="flex-1">{children}</main>
      <AppFooter />
      <ContributionPrompt />
    </div>
  )
}
