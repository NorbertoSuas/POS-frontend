import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { CashRegisterReportsService, CashRegisterReport, SessionReport, MovementReport, AnalyticsData } from '../../services/cash-register-reports.service';
import { CashRegisterService } from '../../services/cash-register.service';
import { CashRegisterSessionService } from '../../services/cash-register-session.service';
import { CashRegisterMovementService } from '../../services/cash-register-movement.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-cash-register-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cash-register-reports.html',
  styleUrl: './cash-register-reports.css'
})
export class CashRegisterReportsPage implements OnInit, OnDestroy {
  activeTab = 'analytics';
  reportFiltersForm: FormGroup;
  private refreshSubscription?: Subscription;

  constructor(
    public reportsService: CashRegisterReportsService,
    public cashRegisterService: CashRegisterService,
    public sessionService: CashRegisterSessionService,
    public movementService: CashRegisterMovementService,
    private fb: FormBuilder
  ) {
    this.reportFiltersForm = this.fb.group({
      startDate: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)],
      endDate: [new Date()],
      cashRegisterIds: [[]],
      movementTypeIds: [[]],
      sessionStatuses: [[]]
    });
  }

  ngOnInit() {
    this.loadData();
    this.setupAutoRefresh();
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  private loadData() {
    this.cashRegisterService.loadCashRegisters();
    this.sessionService.loadSessions();
    this.movementService.loadMovements();
  }

  // Refresh reports data
  refreshReports() {
    this.loadData();
  }

  // Export reports
  exportReports() {
    // Implementation for exporting reports
    console.log('Exporting reports...');
  }

  private setupAutoRefresh() {
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadData();
    });
  }

  // Tab management
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  // Filter management
  applyFilters() {
    const formValue = this.reportFiltersForm.value;
    this.reportsService.updateFilters({
      startDate: new Date(formValue.startDate),
      endDate: new Date(formValue.endDate),
      cashRegisterIds: formValue.cashRegisterIds || [],
      movementTypeIds: formValue.movementTypeIds || [],
      sessionStatuses: formValue.sessionStatuses || []
    });
  }

  resetFilters() {
    this.reportsService.resetFilters();
    this.reportFiltersForm.patchValue({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      cashRegisterIds: [],
      movementTypeIds: [],
      sessionStatuses: []
    });
  }

  // Export methods
  exportCashRegisterReports() {
    const reports = this.reportsService.cashRegisterReports();
    const exportData = reports.map(report => ({
      'Cash Register': report.cashRegister.name,
      'Description': report.cashRegister.description || '',
      'Branch ID': report.cashRegister.branchId,
      'Total Sessions': report.totalSessions,
      'Active Sessions': report.activeSessions,
      'Total Movements': report.totalMovements,
      'Total Income': report.totalIncome,
      'Total Expenses': report.totalExpenses,
      'Net Balance': report.netBalance,
      'Average Session Duration (hours)': (report.averageSessionDuration / (1000 * 60 * 60)).toFixed(2),
      'Last Activity': report.lastActivity ? report.lastActivity.toISOString().split('T')[0] : 'N/A'
    }));
    this.reportsService.exportToCSV(exportData, 'cash-register-reports');
  }

  exportSessionReports() {
    const reports = this.reportsService.sessionReports();
    const exportData = reports.map(report => ({
      'Cash Register': report.cashRegisterName,
      'Employee ID': report.session.employeeId,
      'Open Date': new Date(report.session.openDate).toISOString().split('T')[0],
      'Close Date': report.session.closeDate ? new Date(report.session.closeDate).toISOString().split('T')[0] : 'N/A',
      'Opening Balance': report.session.openingBalance,
      'Closing Balance': report.session.closingBalance || 'N/A',
      'Total Movements': report.totalMovements,
      'Total Income': report.totalIncome,
      'Total Expenses': report.totalExpenses,
      'Net Balance': report.netBalance,
      'Duration (hours)': (report.duration / (1000 * 60 * 60)).toFixed(2),
      'Discrepancy': report.discrepancy,
      'Status': report.session.status
    }));
    this.reportsService.exportToCSV(exportData, 'session-reports');
  }

  exportMovementReports() {
    const reports = this.reportsService.movementReports();
    const exportData = reports.map(report => ({
      'Date': report.date.toISOString().split('T')[0],
      'Cash Register': report.cashRegisterName,
      'Movement Type': report.movementType,
      'Category': report.category,
      'Amount': report.amount,
      'Description': report.description,
      'Reference': report.reference
    }));
    this.reportsService.exportToCSV(exportData, 'movement-reports');
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  }

  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'closed':
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
      case 'suspended':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  }

  getCategoryClass(category: string): string {
    switch (category.toLowerCase()) {
      case 'income':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'expense':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      case 'transfer':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  }

  getAmountClass(category: string): string {
    switch (category.toLowerCase()) {
      case 'income':
        return 'text-green-600 dark:text-green-400';
      case 'expense':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  }

  // Analytics helpers
  getAnalyticsData(): AnalyticsData {
    return this.reportsService.analyticsData();
  }

  getCashRegisterReports(): CashRegisterReport[] {
    return this.reportsService.cashRegisterReports();
  }

  getSessionReports(): SessionReport[] {
    return this.reportsService.sessionReports();
  }

  getMovementReports(): MovementReport[] {
    return this.reportsService.movementReports();
  }

  // Chart data helpers (for future chart implementation)
  getDailyChartData() {
    const dailySummary = this.getAnalyticsData().dailySummary;
    return {
      labels: dailySummary.map(d => this.formatDate(d.date)),
      datasets: [
        {
          label: 'Income',
          data: dailySummary.map(d => d.totalIncome),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)'
        },
        {
          label: 'Expenses',
          data: dailySummary.map(d => d.totalExpenses),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)'
        }
      ]
    };
  }

  getCategoryChartData() {
    const movements = this.getMovementReports();
    const categoryTotals = movements.reduce((acc, movement) => {
      acc[movement.category] = (acc[movement.category] || 0) + movement.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ]
      }]
    };
  }
}
