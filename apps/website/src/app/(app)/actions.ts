"use server"

import { updateTag, refresh } from "next/cache"

/**
 * Server action to invalidate the user-profile cache tag.
 * Call this after updating profile data (e.g. avatar) so that
 * server-side fetches tagged with 'user-profile' are refreshed,
 * and the client-side router cache is also invalidated.
 */
export async function revalidateProfile() {
  updateTag("user-profile")
  refresh()
}

/**
 * Server action to invalidate company data cache.
 * Call this after submitting salary, review, or benefit data.
 */
export async function revalidateCompanyData() {
  updateTag("company-data")
  refresh()
}
