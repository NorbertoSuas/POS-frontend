import { Component, input, output, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);
  private themeChangeListener: (() => void) | null = null;
  
  currentPage = input.required<number>();
  totalItems = input.required<number>();
  pageSize = input.required<number>();
  pageSizeOptions = input<number[]>([10, 20, 50, 100]);

  pageChange = output<number>();
  pageSizeChange = output<number>();

  // Theme detection with signal
  private _isDarkMode = signal(false);
  isDarkMode = this._isDarkMode.asReadonly();

  // Computed properties
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));
  
  startItem = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);
  
  endItem = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalItems()));
  
  ngOnInit() {
    console.log('🎨 Pagination component initialized');
    this.updateThemeState();
    console.log('🎨 Current theme state:', this.themeService.getCurrentThemeState());
    console.log('🎨 Is dark mode:', this._isDarkMode());
    
    // Listen for theme changes
    this.themeChangeListener = () => {
      console.log('🎨 Theme change detected in pagination component');
      this.updateThemeState();
    };
    
    window.addEventListener('themeChanged', this.themeChangeListener);
    
    // Also listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.themeChangeListener);
  }
  
  ngOnDestroy() {
    if (this.themeChangeListener) {
      window.removeEventListener('themeChanged', this.themeChangeListener);
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.themeChangeListener);
    }
  }
  
  private updateThemeState() {
    const darkMode = this.themeService.isDarkMode();
    console.log('🎨 Updating theme state in pagination component:', darkMode);
    this._isDarkMode.set(darkMode);
  }
  
  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];
    
    if (total <= 7) {
      // If there are 7 pages or less, show all
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Logic to show pages with ellipsis
      if (current <= 4) {
        // Initial pages
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 3) {
        // Final pages
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // Intermediate pages
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      }
    }
    
    return pages;
  });

  canGoPrevious = computed(() => this.currentPage() > 1);
  
  canGoNext = computed(() => this.currentPage() < this.totalPages());

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const newPageSize = parseInt(select.value, 10);
    this.pageSizeChange.emit(newPageSize);
  }

  goToFirst() {
    this.onPageChange(1);
  }

  goToPrevious() {
    this.onPageChange(this.currentPage() - 1);
  }

  goToNext() {
    this.onPageChange(this.currentPage() + 1);
  }

  goToLast() {
    this.onPageChange(this.totalPages());
  }

  isPageNumber(page: any): page is number {
    return typeof page === 'number';
  }

  isCurrentPage(page: number): boolean {
    return page === this.currentPage();
  }
}
