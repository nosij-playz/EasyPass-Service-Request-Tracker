// scripts/seed.ts
import { createAdminClient } from '../lib/supabase/admin'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const TEST_USERS = [
  { email: 'admin@test.com', password: 'Password123!', role: 'admin' },
  { email: 'viewer@test.com', password: 'Password123!', role: 'viewer' },
]

const COMPANIES = [
  { name: 'Falcon Trading LLC' },
  { name: 'Oasis Foods FZE' },
  { name: 'Marina Tech DMCC' },
]

async function seed() {
  const supabase = createAdminClient()
  console.log('🌱 Seeding started...')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL is not set in .env.local')
    return
  }

  console.log('✅ Environment loaded successfully!')

  // 1. Create companies (check if exists first)
  const companyIds: Record<string, string> = {}
  for (const company of COMPANIES) {
    // Check if company already exists
    let { data: existing } = await supabase
      .from('companies')
      .select('id')
      .eq('name', company.name)
      .single()

    let companyId = existing?.id

    if (!companyId) {
      // Insert new company
      const { data, error } = await supabase
        .from('companies')
        .insert({ name: company.name })
        .select()
        .single()

      if (error) {
        console.error('Error creating company:', error)
        return
      }
      companyId = data.id
      console.log(`✅ Created company: ${company.name} (${companyId})`)
    } else {
      console.log(`ℹ️ Company exists: ${company.name} (${companyId})`)
    }
    companyIds[company.name] = companyId
  }

  // 2. Get or create users
  const userIds: Record<string, string> = {}
  for (const user of TEST_USERS) {
    // Check if user exists
    const { data: existing, error: fetchError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', user.email)
      .maybeSingle()

    let userId = existing?.id

    if (!userId) {
      // Create user via admin API
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      })
      if (error) {
        console.error('Error creating user:', error)
        return
      }
      userId = data.user.id
      console.log(`✅ Created user: ${user.email} (${userId})`)
    } else {
      console.log(`ℹ️ User exists: ${user.email} (${userId})`)
    }
    userIds[user.email] = userId
  }

  // 3. Assign memberships
  const memberships = [
    { email: 'admin@test.com', company: 'Falcon Trading LLC', role: 'admin' },
    { email: 'admin@test.com', company: 'Oasis Foods FZE', role: 'viewer' },
    { email: 'viewer@test.com', company: 'Falcon Trading LLC', role: 'viewer' },
    { email: 'viewer@test.com', company: 'Marina Tech DMCC', role: 'admin' },
  ]

  for (const membership of memberships) {
    const userId = userIds[membership.email]
    const companyId = companyIds[membership.company]

    if (!userId || !companyId) {
      console.warn(`Skipping membership: ${membership.email} -> ${membership.company}`)
      continue
    }

    // Check if membership exists
    const { data: existing } = await supabase
      .from('company_members')
      .select('id')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .maybeSingle()

    if (!existing) {
      const { error } = await supabase
        .from('company_members')
        .insert({
          user_id: userId,
          company_id: companyId,
          role: membership.role,
        })

      if (error) {
        console.error('Error creating membership:', error)
      } else {
        console.log(`✅ Membership: ${membership.email} -> ${membership.company} (${membership.role})`)
      }
    } else {
      console.log(`ℹ️ Membership exists: ${membership.email} -> ${membership.company}`)
    }
  }

  // 4. Seed sample service requests
  const sampleRequests = [
    { company: 'Falcon Trading LLC', title: 'Visa renewal for Ahmed', status: 'in_progress' },
    { company: 'Falcon Trading LLC', title: 'Trade licence update', status: 'submitted' },
    { company: 'Oasis Foods FZE', title: 'Customs clearance request', status: 'completed' },
    { company: 'Marina Tech DMCC', title: 'Employee visa renewal', status: 'submitted' },
  ]

  for (const req of sampleRequests) {
    const companyId = companyIds[req.company]
    if (!companyId) continue

    // Check if request exists
    const { data: existing } = await supabase
      .from('service_requests')
      .select('id')
      .eq('company_id', companyId)
      .eq('title', req.title)
      .maybeSingle()

    if (!existing) {
      const { error } = await supabase
        .from('service_requests')
        .insert({
          company_id: companyId,
          title: req.title,
          status: req.status,
        })

      if (error) {
        console.error('Error seeding request:', error)
      } else {
        console.log(`✅ Request: ${req.title} (${req.company})`)
      }
    } else {
      console.log(`ℹ️ Request exists: ${req.title} (${req.company})`)
    }
  }

  console.log('🌱 Seeding completed!')
  console.log('\n📋 Test Accounts:')
  console.log('  Admin:  admin@test.com / Password123!')
  console.log('  Viewer: viewer@test.com / Password123!')
}

seed().catch(console.error)