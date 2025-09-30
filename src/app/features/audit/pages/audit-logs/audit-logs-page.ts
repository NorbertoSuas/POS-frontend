import { Component, signal, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuditLog, CreateAuditLogDto, UpdateAuditLogDto, AuditLogFilters } from '../../types/audit.types';
import { AuditLogService } from '../../services/audit-log.service';
import { CreateAuditLogModal } from '../../components/create-audit-log-modal/create-audit-log-modal';
import { EditAuditLogModal } from '../../components/edit-audit-log-modal/edit-audit-log-modal.component';
import { AuditLogFiltersComponent } from '../../components/audit-log-filters/audit-log-filters.component';
import { AuditLogTableComponent } from '../../components/audit-log-table/audit-log-table.component';
import { PaginationComponent } from '../../../../shared/components';

@Component({
  selector: 'app-audit-logs-page',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    CreateAuditLogModal,
    EditAuditLogModal,
    AuditLogFiltersComponent,
    AuditLogTableComponent,
    PaginationComponent
  ],
  templateUrl: './audit-logs-page.html',
  styleUrls: ['./audit-logs-page.css']
})
export class AuditLogsPage implements OnInit, OnDestroy {
  private readonly auditLogService = inject(AuditLogService);
  private readonly subscription = new Subscription();
  
  // Service signals
  readonly auditLogs = this.auditLogService.getAuditLogs;
  readonly loading = this.auditLogService.getLoading;
  readonly total = this.auditLogService.getTotal;
  readonly currentPage = this.auditLogService.getCurrentPage;
  readonly pageSize = this.auditLogService.getPageSize;
  readonly currentFilters = this.auditLogService.getCurrentFilters;
  
  // Computed signals for derived state
  readonly hasData = computed(() => this.auditLogs().length > 0);
  readonly showEmptyState = computed(() => !this.loading() && !this.hasData());
  readonly showTable = computed(() => !this.loading() && this.hasData());
  readonly showPagination = computed(() => this.total() > 0);
  
  // Local state
  showCreateModal = signal(false);
  showEditModal = signal(false);
  selectedAuditLog = signal<AuditLog | null>(null);

  ngOnInit() {
    console.log('🚀 AuditLogsPage initialized');
    console.log('📊 Initial signals state:', {
      auditLogs: this.auditLogs().length,
      loading: this.loading(),
      total: this.total(),
      currentPage: this.currentPage(),
      pageSize: this.pageSize(),
      currentFilters: this.currentFilters()
    });
    
    this.loadAuditLogs();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadAuditLogs() {
    console.log('🔄 Loading audit logs...');
    const filters = this.currentFilters();
    const page = this.currentPage();
    const size = this.pageSize();
    
    console.log('📊 Current state:', { filters, page, size });
    
    this.subscription.add(
      this.auditLogService.getAllAuditLogs(filters, page, size).subscribe({
        next: (response) => {
          console.log('✅ Audit logs loaded successfully:', response);
        },
        error: (error) => {
          console.error('❌ Error loading audit logs:', error);
        }
      })
    );
  }

  openCreateModal() {
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  openEditModal(auditLog: AuditLog) {
    this.selectedAuditLog.set(auditLog);
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedAuditLog.set(null);
  }

  onCreateAuditLog(auditLogData: CreateAuditLogDto) {
    this.subscription.add(
      this.auditLogService.createAuditLog(auditLogData).subscribe(newLog => {
        if (newLog) {
          this.closeCreateModal();
          this.loadAuditLogs();
        }
      })
    );
  }

  onUpdateAuditLog(auditLogData: UpdateAuditLogDto) {
    this.subscription.add(
      this.auditLogService.updateAuditLog(auditLogData.id, auditLogData).subscribe(updatedLog => {
        if (updatedLog) {
          this.closeEditModal();
          this.loadAuditLogs();
        }
      })
    );
  }

  onDeleteAuditLog(id: number) {
    if (confirm('Are you sure you want to delete this audit log?')) {
      this.subscription.add(
        this.auditLogService.deleteAuditLog(id).subscribe(success => {
          if (success) {
            this.loadAuditLogs();
          }
        })
      );
    }
  }

  onFiltersChange(filters: AuditLogFilters) {
    this.auditLogService.updateFilters(filters);
  }

  onPageChange(page: number) {
    this.auditLogService.goToPage(page);
  }

  onPageSizeChange(pageSize: number) {
    this.auditLogService.setPageSize(pageSize);
  }

  exportAuditLogs(format: 'csv' | 'excel' = 'csv') {
    const filters = this.currentFilters();
    this.subscription.add(
      this.auditLogService.exportAuditLogs(filters, format).subscribe(blob => {
        if (blob) {
          this.downloadFile(blob, `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`);
        }
      })
    );
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  refreshData() {
    this.loadAuditLogs();
  }
}
