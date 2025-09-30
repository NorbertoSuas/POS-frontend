import {
  Component,
  computed,
  inject,
  Input,
  input,
  output,
  signal,
  WritableSignal,
} from '@angular/core';
import { ModalService } from '../../services/modal';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  private modalService = inject(ModalService);

  /** Modal title */
  title = input<string>('');
  /** Modal type to identify if it should be shown */
  type = input<string | null>(null);
  isOpen = computed(() => this.modalService.isOpen(this.type()));
   // title priority: service modalTitle() > @Input() title > empty
  titleToShow = computed(() => this.modalService.modalTitle() ?? this.title ?? '');

  close() {
    this.modalService.close();
  }
}
