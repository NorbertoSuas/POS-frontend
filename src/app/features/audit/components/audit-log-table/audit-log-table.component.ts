import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLog } from '../../types/audit.types';

@Component({
  selector: 'app-audit-log-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-log-table.component.html',
  styleUrls: ['./audit-log-table.component.css']
})
export class AuditLogTableComponent {
  auditLogs = input.required<AuditLog[]>();
  loading = input.required<boolean>();

  editAuditLog = output<AuditLog>();
  deleteAuditLog = output<number>();

  // Computed signals for derived state
  readonly hasData = computed(() => this.auditLogs().length > 0);
  readonly showTable = computed(() => !this.loading() && this.hasData());

  // Utility methods for the table
  getActionBadgeClass(action: string): string {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return 'badge-success';
      case 'UPDATE':
        return 'badge-warning';
      case 'DELETE':
        return 'badge-error';
      case 'LOGIN':
        return 'badge-info';
      case 'LOGOUT':
        return 'badge-secondary';
      case 'EXPORT':
        return 'badge-accent';
      case 'IMPORT':
        return 'badge-primary';
      case 'APPROVE':
        return 'badge-success';
      case 'REJECT':
        return 'badge-error';
      default:
        return 'badge-outline';
    }
  }

  formatDate(date: Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRelativeTime(date: Date): string {
    if (!date) return '-';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} h ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} days ago`;
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} months ago`;
    }
  }

  truncateText(text: string, maxLength: number = 50): string {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  onEdit(auditLog: AuditLog) {
    this.editAuditLog.emit(auditLog);
  }

  onDelete(id: number) {
    this.deleteAuditLog.emit(id);
  }
}
