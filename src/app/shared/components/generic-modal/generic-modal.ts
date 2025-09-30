import { Component, EventEmitter, input, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generic-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generic-modal.html',
  styleUrl: './generic-modal.css'
})
export class GenericModal {
  /** Visibility control */
  isOpen = input.required<boolean>();
  /** Optional title text */
  title = input.required<string>();
  /** Event that the parent triggers when closing */
  @Output() closed = new EventEmitter<void>();

  /** Method to close the modal */
  close() {
    this.closed.emit();
  }
}
