import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'theme';
  private readonly currentTheme = signal<Theme>('system');

  constructor() {
    // Apply theme immediately when constructing the service
    this.initializeTheme();
    
    // Listen for changes in system preferences
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.getTheme() === 'system') {
        this.applyTheme();
      }
    });
  }

  private initializeTheme() {
    const savedTheme = this.getTheme();
    this.currentTheme.set(savedTheme);
    this.applyTheme();
    console.log('🎨 Theme initialized:', savedTheme);
  }

  applyTheme() {
    const theme = this.getTheme();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = theme === 'dark' || (theme === 'system' && prefersDark);
    
    // Apply dark class to documentElement and body
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      console.log('🌙 Applying dark mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      console.log('☀️ Applying light mode');
    }
    
    // Force style application
    this.forceStyleUpdate();
    
    console.log('🎨 Theme applied:', theme, '- Dark mode:', shouldBeDark);
  }

  private forceStyleUpdate() {
    // Force style update
    const style = document.createElement('style');
    style.textContent = 'body { transition: none; }';
    document.head.appendChild(style);
    
    // Remove after one frame
    requestAnimationFrame(() => {
      document.head.removeChild(style);
      document.body.style.transition = '';
    });
  }

  setTheme(theme: Theme) {
    console.log('🎨 Changing theme to:', theme);
    
    if (theme === 'system') {
      localStorage.removeItem(this.storageKey);
    } else {
      localStorage.setItem(this.storageKey, theme);
    }
    
    this.currentTheme.set(theme);
    this.applyTheme();
    
    // Dispatch custom event to notify changes
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  getTheme(): Theme {
    return (localStorage.getItem(this.storageKey) as any) || 'system';
  }

  getCurrentTheme() {
    return this.currentTheme.asReadonly();
  }

  isDarkMode(): boolean {
    const theme = this.getTheme();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return theme === 'dark' || (theme === 'system' && prefersDark);
  }

  // Method to check current theme state
  getCurrentThemeState() {
    const isDark = document.documentElement.classList.contains('dark');
    const dataTheme = document.documentElement.getAttribute('data-theme');
    const bodyDark = document.body.classList.contains('dark');
    
    return {
      htmlDark: isDark,
      dataTheme,
      bodyDark,
      localStorage: this.getTheme(),
      systemPrefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches
    };
  }
}