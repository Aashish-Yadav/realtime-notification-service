import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: '220px',
        minHeight: '100vh',
        background: 'var(--bg-base)',
        padding: '36px 40px',
        maxWidth: 'calc(100vw - 220px)',
      }}>
        <Outlet />
      </main>
    </div>
  )
}