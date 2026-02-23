import { EmpliqLogo } from "@/components/EmpliqLogo"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <EmpliqLogo className="h-7 w-auto text-foreground" />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md space-y-6 p-8">
            <blockquote className="text-lg font-medium text-foreground/80">
              &ldquo;La transparencia laboral empieza cuando las personas se atreven a compartir lo que saben.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-foreground/60">E</span>
              </div>
              <div>
                <p className="text-sm font-medium">Empliq</p>
                <p className="text-xs text-muted-foreground">Transparencia laboral para el Perú</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
