// app/api/sync-invoices/route.ts
import { NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase/admin'

export async function POST() {
  const supabase = createAdminClient()

  try {
    // 1. Fetch mock data
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/mock-erp/invoices`)
    if (!res.ok) throw new Error('Failed to fetch mock ERP data')
    const { invoices } = await res.json()

    // 2. Get company name -> id mapping
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name')
    const companyMap = Object.fromEntries(companies?.map(c => [c.name, c.id]) || [])

    let inserted = 0
    let updated = 0
    let skipped = 0

    // 3. Process each invoice
    for (const inv of invoices) {
      const companyId = companyMap[inv.company_name]
      if (!companyId) {
        console.warn(`Company not found: ${inv.company_name}`)
        skipped++
        continue
      }

      // Check if invoice already exists
      const { data: existing } = await supabase
        .from('invoices')
        .select('external_updated_at')
        .eq('external_id', inv.external_id)
        .maybeSingle()

      if (existing) {
        // Check if the new data is newer
        const existingDate = new Date(existing.external_updated_at)
        const newDate = new Date(inv.updated_at)
        
        if (newDate > existingDate) {
          // Update the invoice
          const { error } = await supabase
            .from('invoices')
            .update({
              company_id: companyId,
              amount_aed: inv.amount_aed,
              status: inv.status,
              external_updated_at: inv.updated_at,
              synced_at: new Date().toISOString(),
            })
            .eq('external_id', inv.external_id)

          if (error) {
            console.error('Update error:', error)
          } else {
            updated++
          }
        }
      } else {
        // Insert new invoice
        const { error } = await supabase
          .from('invoices')
          .insert({
            external_id: inv.external_id,
            company_id: companyId,
            amount_aed: inv.amount_aed,
            status: inv.status,
            external_updated_at: inv.updated_at,
            synced_at: new Date().toISOString(),
          })

        if (error) {
          console.error('Insert error:', error)
        } else {
          inserted++
        }
      }
    }

    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      totalInvoicesInDb: count,
      inserted,
      updated,
      skipped,
      processed: invoices.length,
    })

  } catch (error: any) {
    console.error('Sync failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}