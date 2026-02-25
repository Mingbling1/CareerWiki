import Image from "next/image"
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
        {/* Background illustration */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <Image
            src="/illustrations/work/work_collaboration.png"
            alt="Colaboracion laboral"
            width={520}
            height={520}
            className="object-contain opacity-[0.07] select-none pointer-events-none"
            priority
          />
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md space-y-6 p-8">
            <blockquote className="text-lg font-medium text-foreground/80">
              &ldquo;La transparencia laboral empieza cuando las personas se atreven a compartir lo que saben.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <Image
                src="/avatars/avatar_woman_long_hair.png"
                alt="Usuario de Empliq"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
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
