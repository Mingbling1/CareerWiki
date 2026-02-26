"use client"

import { createClient } from "@/lib/supabase/client"

/**
 * Get the current user's access token from Supabase.
 * Throws if not authenticated.
 */
export async function getAuthToken(): Promise<string> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error("NO_AUTH")
  }

  return session.access_token
}

/**
 * Get the current user's access token, or null if not authenticated.
 * Non-throwing version for optional auth contexts.
 */
export async function getAuthTokenSafe(): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? null
  } catch {
    return null
  }
}
