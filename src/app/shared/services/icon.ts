import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IconService {

  constructor() { }
   private spritePath = 'assets/icons/sprite.svg';

  /**
   * Returns the complete href for the given icon.
   * @param name Symbol id without "icon-" prefix.
   */
  getIconHref(name: string): string {
    return `${this.spritePath}#icon-${name}`;
  }
}
