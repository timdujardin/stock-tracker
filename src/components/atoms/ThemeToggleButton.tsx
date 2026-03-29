import type { FC } from 'react';

import { useTheme } from '@/contexts/ThemeContext';

/** Renders a button that toggles between light and dark theme */
export const ThemeToggleButton: FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Donker thema' : 'Licht thema'}
      title={theme === 'light' ? 'Donker thema' : 'Licht thema'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
