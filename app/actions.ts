// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../lib/supabase/server'

export async function createServiceRequest(companyId: string, title: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('service_requests')
    .insert({ company_id: companyId, title, status: 'submitted' })

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${companyId}`)
}

export async function updateRequestStatus(requestId: string, companyId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('service_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId)

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${companyId}`)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}