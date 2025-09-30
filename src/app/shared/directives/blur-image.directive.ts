// src/app/shared/directives/blur-image.directive.ts
import { Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[blurImage]',
  standalone: true
})
export class BlurImageDirective {
  @HostBinding('class') get classes(): string {
    return this.isLoaded 
      ? 'blur-0 opacity-100 transition-all duration-250 ease-in-out' 
      : 'blur-sm opacity-0 transition-all duration-250 ease-in-out';
  }

  private isLoaded = false;

  constructor(private el: ElementRef) {}

  @HostListener('load')
  onLoad() {
    this.isLoaded = true;
  }

  @HostListener('error')
  onError() {
    // Manejar errores de carga si es necesario
    this.isLoaded = true;
  }
}