import { LoginForm } from "@/components/auth/LoginForm"
import { EmpliqLogo } from "@/components/EmpliqLogo"

export function LoginPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
      
      <div className="relative flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium text-foreground">
          <EmpliqLogo className="h-8 w-auto" />
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
