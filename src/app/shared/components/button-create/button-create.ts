import { Component, computed, input, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { IconService } from '../../services/icon';

@Component({
  selector: 'app-button-create',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './button-create.html',
  styleUrl: './button-create.css',
})
export class ButtonCreate {
  /** Icon name (without "icon-" prefix) */
  iconName = input<string>('plus');

  /** Label that appears next to the icon */
  label = input<string>('');
  /** Icon size in pixels */
  size = input<number>(24);

  /** Computed href for the SVG <use> */
  iconHref = computed(() => this.iconService.getIconHref(this.iconName()));

  constructor(private iconService: IconService) {}
}
