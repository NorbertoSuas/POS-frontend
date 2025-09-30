import { Injectable, signal, WritableSignal } from '@angular/core';

export type ModalType = string | null;

@Injectable({ providedIn: 'root' })
export class ModalService {
  /** Tipo de modal abierto */
  readonly modalType: WritableSignal<ModalType> = signal<ModalType>(null);
  /** Data asociada al modal */
  readonly modalData: WritableSignal<any> = signal<any>(null);
  readonly modalTitle: WritableSignal<string> = signal<string>('');

  open(type: ModalType,title: string, data?: any) {
    this.modalType.set(type);
    this.modalTitle.set(title);
    this.modalData.set(data ?? null);
  }

  close() {
    this.modalType.set(null);
    this.modalData.set(null);
    this.modalTitle.set('');
  }

  isOpen(type?: ModalType): boolean {
    if (type) return this.modalType() === type;
    return this.modalType() !== null;
  }
}