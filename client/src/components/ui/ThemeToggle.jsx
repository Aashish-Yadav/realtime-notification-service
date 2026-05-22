import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="btn-icon"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <span style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        transform: theme === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)',
        opacity: theme === 'dark' ? 1 : 0,
        position: theme === 'light' ? 'absolute' : 'static',
      }}>
        <Moon size={15} />
      </span>
      <span style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        transform: theme === 'light' ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0)',
        opacity: theme === 'light' ? 1 : 0,
        position: theme === 'dark' ? 'absolute' : 'static',
        color: 'var(--warning)',
      }}>
        <Sun size={15} />
      </span>
    </button>
  )
}