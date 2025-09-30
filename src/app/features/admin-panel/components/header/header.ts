import { Component, EventEmitter, inject, Output, signal, OnInit } from '@angular/core';
import { ThemeService, Theme } from '../../../../core/services/theme';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  private readonly themeService = inject(ThemeService);
  currentTheme = signal<Theme>('system');

  ngOnInit() {
    // Initialize with current theme
    this.currentTheme.set(this.themeService.getTheme());
    console.log('🎨 Header initialized with theme:', this.currentTheme());
  }

  onThemeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as Theme;
    console.log('🎨 User selected theme:', value);
    this.changeTheme(value);
  }

  changeTheme(theme: Theme) {
    console.log('🎨 Changing theme from header:', theme);
    this.themeService.setTheme(theme);
    this.currentTheme.set(theme);
    
    // Force DOM update
    setTimeout(() => {
              console.log('🎨 Theme updated, classes in documentElement:', document.documentElement.classList.toString());
    }, 100);
  }
}