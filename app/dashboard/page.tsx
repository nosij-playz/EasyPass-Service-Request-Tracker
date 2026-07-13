// app/dashboard/page.tsx
'use client'

import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/login')
        return
      }
      setUser(authUser)
      
      const { data: memberships } = await supabase
        .from('company_members')
        .select('company_id, role, companies(*)')
        .eq('user_id', authUser.id)

      setCompanies(memberships || [])
      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Your Companies</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>

      {companies.length === 0 ? (
        <p>You are not a member of any company.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {companies.map((membership: any) => (
            <div key={membership.company_id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h2>{membership.companies.name}</h2>
              <p>Role: <strong>{membership.role}</strong></p>
              <a href={`/dashboard/${membership.company_id}`} style={{ color: '#2563EB' }}>
                View Requests →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}