// app/dashboard/[companyId]/page.tsx
'use client'

import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Props {
  params: { companyId: string }
}

export default function CompanyPage({ params }: Props) {
  const router = useRouter()
  const [company, setCompany] = useState<any>(null)
  const [membership, setMembership] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name')
        .eq('id', params.companyId)
        .single()

      if (!companyData) {
        router.push('/dashboard')
        return
      }
      setCompany(companyData)

      const { data: membershipData } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', params.companyId)
        .eq('user_id', user.id)
        .single()

      setMembership(membershipData)
      setIsAdmin(membershipData?.role === 'admin')

      const { data: requestsData } = await supabase
        .from('service_requests')
        .select('*')
        .eq('company_id', params.companyId)
        .order('created_at', { ascending: false })

      setRequests(requestsData || [])
      setLoading(false)
    }

    fetchData()
  }, [params.companyId, router])

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const supabase = createClient()
    const { error } = await supabase
      .from('service_requests')
      .insert({
        company_id: params.companyId,
        title: newTitle.trim(),
        status: 'submitted'
      })

    if (!error) {
      setNewTitle('')
      // Refresh requests
      const { data } = await supabase
        .from('service_requests')
        .select('*')
        .eq('company_id', params.companyId)
        .order('created_at', { ascending: false })
      setRequests(data || [])
    }
  }

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('service_requests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', requestId)

    if (!error) {
      const { data } = await supabase
        .from('service_requests')
        .select('*')
        .eq('company_id', params.companyId)
        .order('created_at', { ascending: false })
      setRequests(data || [])
    }
  }

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
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>{company?.name}</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>

      <p>Your role: <strong>{membership?.role}</strong> {isAdmin ? '(Admin - Can create and update)' : '(Viewer - Read only)'}</p>

      {isAdmin && (
        <div style={{ border: '1px solid #ddd', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
          <h3>Create New Request</h3>
          <form onSubmit={handleCreateRequest} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Request title..."
              style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              required
            />
            <button type="submit" style={{ padding: '8px 16px', background: '#22C55E', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Add Request
            </button>
          </form>
        </div>
      )}

      <h2>Service Requests ({requests.length})</h2>
      
      {requests.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <div>
          {requests.map((req) => (
            <div key={req.id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>{req.title}</h3>
                <p style={{ margin: '5px 0' }}>Status: <strong>{req.status}</strong></p>
                <small>Created: {new Date(req.created_at).toLocaleDateString()}</small>
              </div>
              {isAdmin && (
                <select
                  value={req.status}
                  onChange={(e) => handleUpdateStatus(req.id, e.target.value)}
                  style={{ padding: '5px 10px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="submitted">Submitted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}