import './BottomNav.css';

import type { FC } from 'react';
import { NavLink } from 'react-router-dom';

import { NAV_ITEMS } from '@/config/navigation.config';

import { bottomNavItem } from './BottomNav.styles';

/** Renders the bottom navigation bar with category links */
export const BottomNav: FC = () => (
  <nav className="bottom-nav" role="navigation" aria-label="Categorienavigatie">
    {NAV_ITEMS.map(({ to, label, icon }) => (
      <NavLink key={to} to={to} className={({ isActive }) => bottomNavItem({ active: isActive || undefined })}>
        <span className="bottom-nav__icon">{icon}</span>
        <span className="bottom-nav__label">{label}</span>
      </NavLink>
    ))}
  </nav>
);
