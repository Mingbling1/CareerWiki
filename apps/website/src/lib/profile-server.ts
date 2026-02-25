import { createClient } from "@/lib/supabase/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

/**
 * Fetch the current user's profile avatar server-side.
 * Tagged with 'user-profile' so it can be revalidated on demand
 * via revalidateTag('user-profile').
 */
export async function getProfileAvatar(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return null

    const res = await fetch(`${API_URL}/profiles/me`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      next: { tags: ["user-profile"] },
    })

    if (!res.ok) return null
    const profile = await res.json()
    return profile.avatarUrl ?? null
  } catch {
    return null
  }
}
