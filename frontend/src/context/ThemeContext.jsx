import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Güvenli localStorage kontrolü
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme;
    } catch (error) {
      console.log('localStorage error:', error);
    }

    // Sistem tercihini kontrol et
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (error) {
      console.log('matchMedia error:', error);
    }

    return 'light';
  });

  useEffect(() => {
    // HTML root element'e tema class'ı ekle
    try {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // LocalStorage'a kaydet
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.log('Theme effect error:', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};