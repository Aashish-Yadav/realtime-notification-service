import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Users, ArrowRight, Trash2, AlertCircle } from 'lucide-react'
import { sitesApi } from '../services/api'

export default function Sites() {
  const [sites, setSites]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [deleting, setDeleting] = useState(null)

  const fetchSites = () => {
    sitesApi.getAll()
      .then(res => setSites(res.data.sites))
      .catch(() => setError('Failed to load sites.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSites() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this site and all its subscribers?')) return
    setDeleting(id)
    try {
      await sitesApi.delete(id)
      setSites(s => s.filter(site => site._id !== id))
    } catch {
      setError('Failed to delete site.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="page-enter">
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
          Management
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', letterSpacing: '-0.03em' }}>
          Your Sites
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Sites auto-register when a visitor subscribes using your script tag.
        </p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '84px', borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : sites.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Globe size={22} /></div>
            <p style={{ fontWeight: 700, fontSize: '15px' }}>No sites registered</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '300px' }}>
              Paste your script tag on any website. It will appear here the moment the first visitor subscribes.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sites.map((site, i) => (
            <div
              key={site._id}
              className="card page-enter"
              style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px', animationDelay: `${0.05 * i}s` }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '10px',
                background: 'var(--accent-soft)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)', flexShrink: 0,
              }}>
                <Globe size={17} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '3px' }}>
                  {site.name || site.domain}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {site.domain}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Added {new Date(site.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <Users size={13} />
                  <span className="stat-number" style={{ fontSize: '15px' }}>{site.subscriberCount}</span>
                </div>

                <span className={`badge ${site.isActive ? 'badge-success' : 'badge-danger'}`}>
                  <span className={`dot ${site.isActive ? 'dot-pulse' : ''}`} />
                  {site.isActive ? 'Active' : 'Paused'}
                </span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn-icon"
                    onClick={() => handleDelete(site._id)}
                    disabled={deleting === site._id}
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger-soft)' }}
                    title="Delete site"
                  >
                    {deleting === site._id ? <span className="spinner" style={{ width: '13px', height: '13px' }} /> : <Trash2 size={13} />}
                  </button>
                  <Link to={`/sites/${site._id}`} className="btn-icon" title="View site">
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}