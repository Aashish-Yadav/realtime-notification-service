import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ui/ThemeToggle'

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{ position: 'fixed', top: '20px', right: '20px' }}>
        <ThemeToggle />
      </div>

      <div className="page-enter" style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '48px', height: '48px',
            background: 'var(--accent)',
            borderRadius: '12px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-accent)',
          }}>
            <Zap size={22} color="var(--text-inverse)" fill="var(--text-inverse)" />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '26px', color: 'var(--text-primary)', letterSpacing: '-0.03em',
          }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
            Sign in to your PushNotify account
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px' }}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{
                  position: 'absolute', left: '12px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                }} />
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{ paddingLeft: '36px' }}
                  required
                />
              </div>
            </div>

            <div>
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{
                  position: 'absolute', left: '12px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                }} />
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ paddingLeft: '36px' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: '4px' }}
            >
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--text-accent)', fontWeight: 600, textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}