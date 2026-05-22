import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Users, Bell, ArrowRight, Plus, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { sitesApi } from '../services/api'

function StatCard({ label, value, icon: Icon, accent, delay }) {
  return (
    <div className="card page-enter" style={{
      padding: '24px',
      animationDelay: delay,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        <div style={{
          width: '34px', height: '34px',
          borderRadius: '8px',
          background: `${accent}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent,
        }}>
          <Icon size={15} />
        </div>
      </div>
      <div className="stat-number" style={{ fontSize: '36px', fontWeight: 500 }}>
        {value ?? <span className="skeleton" style={{ width: '60px', height: '36px', display: 'inline-block' }} />}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [sites, setSites]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sitesApi.getAll()
      .then(res => setSites(res.data.sites))
      .finally(() => setLoading(false))
  }, [])

  const totalSubscribers = sites.reduce((sum, s) => sum + s.subscriberCount, 0)
  const activeSites      = sites.filter(s => s.isActive).length

  return (
    <div className="page-enter">

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
          Overview
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
          Good day, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Here's what's happening across your sites.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Total Sites"       value={loading ? null : sites.length}       icon={Globe}      accent="var(--accent)"   delay="0.05s" />
        <StatCard label="Active Sites"      value={loading ? null : activeSites}         icon={TrendingUp} accent="var(--success)"  delay="0.10s" />
        <StatCard label="Total Subscribers" value={loading ? null : totalSubscribers}    icon={Users}      accent="var(--warning)"  delay="0.15s" />
      </div>

      {/* Sites list */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', letterSpacing: '-0.02em' }}>
          Your Sites
        </h2>
        <Link to="/sites" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-accent)', fontWeight: 600, textDecoration: 'none' }}>
          View all <ArrowRight size={13} />
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '72px', borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : sites.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Globe size={22} /></div>
            <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>No sites yet</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
              Paste your script tag on a website and it will appear here automatically when someone subscribes.
            </p>
            <Link to="/settings" className="btn btn-primary btn-sm" style={{ marginTop: '4px' }}>
              <Plus size={13} /> Get Script Tag
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sites.slice(0, 5).map((site, i) => (
            <Link
              key={site._id}
              to={`/sites/${site._id}`}
              className="card page-enter"
              style={{
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '16px',
                textDecoration: 'none', color: 'inherit',
                animationDelay: `${0.05 * i}s`,
              }}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'var(--accent-soft)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)', flexShrink: 0,
              }}>
                <Globe size={16} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px', color: 'var(--text-primary)' }}>
                  {site.name || site.domain}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {site.domain}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <div className="stat-number" style={{ fontSize: '18px' }}>{site.subscriberCount}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>subs</div>
                </div>
                <span className={`badge ${site.isActive ? 'badge-success' : 'badge-danger'}`}>
                  <span className={`dot ${site.isActive ? 'dot-pulse' : ''}`} />
                  {site.isActive ? 'Active' : 'Paused'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}