import { useTheme } from '../../contexts/ThemeContext'

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Donker thema' : 'Licht thema'}
      title={theme === 'light' ? 'Donker thema' : 'Licht thema'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
