import { useState } from 'react'
import { Copy, Check, RefreshCw, Key, Code, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button className="btn-icon" onClick={handleCopy} title="Copy">
      {copied ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} />}
    </button>
  )
}

export default function Settings() {
  const { user, refreshUser } = useAuth()
  const [regenerating, setRegenerating] = useState(false)
  const [message, setMessage]           = useState('')
  const [error, setError]               = useState('')

  const scriptSnippet = `<script
  src="${window.location.origin}/sdk/loader.js"
  data-api-key="${user?.apiKey}"
  data-server="${window.location.origin}"
></script>`

  const handleRegenerate = async () => {
    if (!confirm('This will invalidate your current API key. All script tags using the old key will stop working until updated. Continue?')) return
    setRegenerating(true)
    setMessage('')
    setError('')
    try {
      await authApi.regenerateKey()
      await refreshUser()
      setMessage('API key regenerated. Update the script tag on all your sites.')
    } catch {
      setError('Failed to regenerate key.')
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="page-enter">
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
          Configuration
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', letterSpacing: '-0.03em' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Your API key and integration script.
        </p>
      </div>

      {message && <div className="alert alert-success" style={{ marginBottom: '20px' }}><CheckCircle size={14} /> {message}</div>}
      {error   && <div className="alert alert-error"   style={{ marginBottom: '20px' }}><AlertCircle size={14} /> {error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>

        {/* Account */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={15} style={{ color: 'var(--accent)' }} /> Account
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[['Name', user?.name], ['Email', user?.email]].map(([label, val]) => (
              <div key={label}>
                <label>{label}</label>
                <div className="input" style={{ cursor: 'default', color: 'var(--text-secondary)' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h2 style={{ fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={15} style={{ color: 'var(--warning)' }} /> API Key
            </h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              {regenerating ? <span className="spinner" /> : <RefreshCw size={12} />}
              Regenerate
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="code-block" style={{ flex: 1, padding: '11px 14px', fontSize: '13px', userSelect: 'all' }}>
              {user?.apiKey}
            </div>
            <CopyButton text={user?.apiKey} />
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px', lineHeight: 1.6 }}>
            Keep this key private. It links all push subscriptions to your account. If compromised, regenerate it — but remember to update the script tag on every site.
          </p>
        </div>

        {/* Script Tag */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h2 style={{ fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code size={15} style={{ color: 'var(--success)' }} /> Integration Script
            </h2>
            <CopyButton text={scriptSnippet} />
          </div>

          <pre className="code-block">{scriptSnippet}</pre>

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              'Paste this tag anywhere in your site\'s HTML, before </body>.',
              'The first time a visitor clicks "Allow", their browser is registered and your site appears in the dashboard.',
              'Works on any static or dynamic site — no backend changes needed on your client\'s end.',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}