import { useState, useEffect } from 'react';
import { Theme } from '../types';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return { mode: (savedTheme as 'light' | 'dark') || 'light' };
  });

  useEffect(() => {
    localStorage.setItem('theme', theme.mode);
    if (theme.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme.mode]);

  const toggleTheme = () => {
    setTheme(prev => ({
      mode: prev.mode === 'light' ? 'dark' : 'light'
    }));
  };

  return { theme, toggleTheme };
};