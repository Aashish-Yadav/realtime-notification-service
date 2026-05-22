import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Globe, Bell, Settings, LogOut, Zap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'

const navItems = [
  { to: '/dashboard',  label: 'Overview',       icon: LayoutDashboard },
  { to: '/sites',      label: 'Sites',           icon: Globe },
  { to: '/notify',     label: 'Send Push',       icon: Bell },
  { to: '/settings',   label: 'Settings',        icon: Settings },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 50,
    }}>

      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--sidebar-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'var(--sidebar-accent)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={16} color="#000" fill="#000" />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '16px',
            color: '#fff',
            letterSpacing: '-0.02em',
          }}>
            PushNotify
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '8px',
              marginBottom: '2px',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--sidebar-active)' : 'var(--sidebar-text)',
              background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
              border: isActive ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              letterSpacing: '0.01em',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={15} color={isActive ? 'var(--sidebar-accent)' : 'currentColor'} />
                {label}
                {isActive && (
                  <div style={{
                    marginLeft: 'auto',
                    width: '4px', height: '4px',
                    borderRadius: '50%',
                    background: 'var(--sidebar-accent)',
                  }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + controls */}
      <div style={{ padding: '12px 10px 16px', borderTop: '1px solid var(--sidebar-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', marginBottom: '6px' }}>
          <div style={{
            width: '28px', height: '28px',
            borderRadius: '50%',
            background: 'var(--sidebar-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700, color: '#000',
            flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', truncate: true, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--sidebar-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', padding: '0 4px' }}>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="btn-icon"
            title="Logout"
            style={{ flex: 1, color: 'var(--danger)', borderColor: 'transparent' }}
          >
            <LogOut size={14} />
            <span style={{ fontSize: '12px', fontWeight: 500 }}>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}