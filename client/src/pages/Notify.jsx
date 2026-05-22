import { useEffect, useState } from 'react'
import { Bell, Globe, Send, CheckCircle, AlertCircle, Link as LinkIcon, Image, AlignLeft } from 'lucide-react'
import { sitesApi, notifyApi } from '../services/api'

export default function Notify() {
  const [sites, setSites]   = useState([])
  const [form, setForm]     = useState({ siteId: '', title: '', description: '', icon: '', url: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')

  useEffect(() => {
    sitesApi.getAll().then(res => {
      const active = res.data.sites.filter(s => s.isActive)
      setSites(active)
      if (active.length > 0) setForm(f => ({ ...f, siteId: active[0]._id }))
    })
  }, [])

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setResult(null)
    setError('')
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!form.siteId || !form.title || !form.description) {
      setError('Site, title and description are required.')
      return
    }
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const res = await notifyApi.send(form)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send notification.')
    } finally {
      setLoading(false)
    }
  }

  const selectedSite = sites.find(s => s._id === form.siteId)

  return (
    <div className="page-enter">
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
          Broadcast
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', letterSpacing: '-0.03em' }}>
          Send Notification
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Push a notification to all subscribers of a site.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'start' }}>

        {/* Form */}
        <div className="card" style={{ padding: '28px' }}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {result && (
            <div className="alert alert-success" style={{ marginBottom: '20px' }}>
              <CheckCircle size={14} />
              {result.message} — {result.stats.sent} sent, {result.stats.failed} failed.
            </div>
          )}

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Site selector */}
            <div>
              <label>Target Site</label>
              {sites.length === 0 ? (
                <div className="alert alert-info">No active sites with subscribers found.</div>
              ) : (
                <select
                  className="input"
                  value={form.siteId}
                  onChange={e => set('siteId', e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  {sites.map(site => (
                    <option key={site._id} value={site._id}>
                      {site.name || site.domain} ({site.subscriberCount} subscribers)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Title */}
            <div>
              <label>Notification Title</label>
              <div style={{ position: 'relative' }}>
                <Bell size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="input"
                  placeholder="e.g. New article published!"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  style={{ paddingLeft: '36px' }}
                  maxLength={80}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label>Description</label>
              <div style={{ position: 'relative' }}>
                <AlignLeft size={13} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <textarea
                  className="input"
                  placeholder="Short description shown in the notification body..."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={3}
                  style={{ paddingLeft: '36px', resize: 'vertical' }}
                  maxLength={200}
                  required
                />
              </div>
            </div>

            {/* Icon URL */}
            <div>
              <label>Icon URL <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <div style={{ position: 'relative' }}>
                <Image size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="input"
                  placeholder="https://yoursite.com/icon.png"
                  value={form.icon}
                  onChange={e => set('icon', e.target.value)}
                  style={{ paddingLeft: '36px' }}
                  type="url"
                />
              </div>
            </div>

            {/* Link */}
            <div>
              <label>Click URL <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(where to go on click)</span></label>
              <div style={{ position: 'relative' }}>
                <LinkIcon size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="input"
                  placeholder="https://yoursite.com/new-post"
                  value={form.url}
                  onChange={e => set('url', e.target.value)}
                  style={{ paddingLeft: '36px' }}
                  type="url"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || sites.length === 0}
              style={{ marginTop: '4px' }}
            >
              {loading
                ? <><span className="spinner" /> Sending...</>
                : <><Send size={14} /> Send to {selectedSite?.subscriberCount ?? 0} Subscribers</>
              }
            </button>
          </form>
        </div>

        {/* Preview */}
        <div>
          <div className="card" style={{ padding: '22px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              Live Preview
            </p>

            {/* OS notification mockup */}
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              borderRadius: '12px',
              padding: '14px',
              boxShadow: 'var(--shadow-lg)',
            }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '8px',
                  background: form.icon ? 'transparent' : 'var(--accent-soft)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {form.icon
                    ? <img src={form.icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                    : <Bell size={16} style={{ color: 'var(--accent)' }} />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '3px' }}>
                    {form.title || 'Notification Title'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {form.description || 'Your notification description will appear here.'}
                  </div>
                  {form.url && (
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '5px', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {form.url}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="divider" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target site</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {selectedSite?.domain || '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Recipients</span>
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
                  {selectedSite?.subscriberCount ?? 0} subscribers
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}