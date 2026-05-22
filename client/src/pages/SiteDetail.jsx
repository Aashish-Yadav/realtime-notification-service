import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Globe, Users, ArrowLeft, Edit2, Check, X, Trash2, Monitor } from 'lucide-react'
import { sitesApi } from '../services/api'

export default function SiteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [site, setSite]             = useState(null)
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading]       = useState(true)
  const [editing, setEditing]       = useState(false)
  const [name, setName]             = useState('')
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    Promise.all([sitesApi.getById(id), sitesApi.getSubscribers(id)])
      .then(([siteRes, subRes]) => {
        setSite(siteRes.data.site)
        setName(siteRes.data.site.name)
        setSubscribers(subRes.data.subscribers)
      })
      .catch(() => setError('Failed to load site.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await sitesApi.update(id, { name })
      setSite(res.data.site)
      setEditing(false)
    } catch {
      setError('Failed to update.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async () => {
    try {
      const res = await sitesApi.update(id, { isActive: !site.isActive })
      setSite(res.data.site)
    } catch {
      setError('Failed to update status.')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this site and all subscribers?')) return
    await sitesApi.delete(id)
    navigate('/sites')
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: 'var(--radius-lg)' }} />)}
    </div>
  )

  if (error) return <div className="alert alert-error"><X size={14} />{error}</div>

  if (!site) return null

  return (
    <div className="page-enter">
      <Link to="/sites" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '24px', fontWeight: 500 }}>
        <ArrowLeft size={13} /> Back to Sites
      </Link>

      {/* Site header */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'var(--accent-soft)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)', flexShrink: 0,
          }}>
            <Globe size={20} />
          </div>

          <div style={{ flex: 1 }}>
            {editing ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                <input
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ maxWidth: '280px', padding: '7px 12px', fontSize: '15px' }}
                  autoFocus
                />
                <button className="btn-icon" onClick={handleSave} disabled={saving} style={{ color: 'var(--success)' }}>
                  {saving ? <span className="spinner" style={{ width: '13px', height: '13px' }} /> : <Check size={14} />}
                </button>
                <button className="btn-icon" onClick={() => setEditing(false)}><X size={14} /></button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}>
                  {site.name || site.domain}
                </h1>
                <button className="btn-icon" onClick={() => setEditing(true)} title="Rename"><Edit2 size={12} /></button>
              </div>
            )}
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{site.domain}</div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              className={`btn btn-sm ${site.isActive ? 'btn-ghost' : 'btn-primary'}`}
              onClick={handleToggle}
            >
              {site.isActive ? 'Pause Site' : 'Activate Site'}
            </button>
            <button className="btn btn-sm btn-danger" onClick={handleDelete}>
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>

        <div className="divider" />

        <div style={{ display: 'flex', gap: '32px' }}>
          {[
            { label: 'Subscribers', value: site.subscriberCount, color: 'var(--accent)' },
            { label: 'Status', value: site.isActive ? 'Active' : 'Paused', color: site.isActive ? 'var(--success)' : 'var(--danger)' },
            { label: 'Registered', value: new Date(site.createdAt).toLocaleDateString(), color: 'var(--text-primary)' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</div>
              <div className="stat-number" style={{ fontSize: '20px', color }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscribers */}
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Users size={14} style={{ color: 'var(--text-secondary)' }} />
        <h2 style={{ fontWeight: 700, fontSize: '15px' }}>Subscribers ({subscribers.length})</h2>
      </div>

      {subscribers.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={20} /></div>
            <p style={{ fontWeight: 600 }}>No subscribers yet</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {subscribers.map((sub, i) => (
            <div key={sub._id} className="card page-enter" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', animationDelay: `${0.03 * i}s` }}>
              <Monitor size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sub.endpoint.slice(0, 60)}...
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
                {new Date(sub.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}