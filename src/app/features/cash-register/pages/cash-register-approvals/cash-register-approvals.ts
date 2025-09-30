import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { CashRegisterApprovalService, ApprovalRequest, ApprovalRule, DiscrepancyReport } from '../../services/cash-register-approval.service';
import { CashRegisterService } from '../../services/cash-register.service';
import { CashRegisterSessionService } from '../../services/cash-register-session.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-cash-register-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GenericModal],
  templateUrl: './cash-register-approvals.html',
  styleUrl: './cash-register-approvals.css'
})
export class CashRegisterApprovalsPage implements OnInit, OnDestroy {
  activeTab = 'requests';
  showApprovalModal = false;
  showRuleModal = false;
  showDiscrepancyModal = false;
  
  selectedRequest: ApprovalRequest | null = null;
  selectedRule: ApprovalRule | null = null;
  selectedDiscrepancy: DiscrepancyReport | null = null;
  
  approvalForm: FormGroup;
  ruleForm: FormGroup;
  discrepancyForm: FormGroup;
  
  private refreshSubscription?: Subscription;

  constructor(
    public approvalService: CashRegisterApprovalService,
    public cashRegisterService: CashRegisterService,
    public sessionService: CashRegisterSessionService,
    private readonly fb: FormBuilder
  ) {
    this.approvalForm = this.fb.group({
      comments: ['', Validators.required]
    });
    
    this.ruleForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      autoApprove: [false],
      requireManagerApproval: [true],
      isActive: [true]
    });
    
    this.discrepancyForm = this.fb.group({
      resolution: ['', Validators.required]
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
    this.approvalService.loadApprovalRequests();
    this.approvalService.loadApprovalRules();
    this.approvalService.loadDiscrepancyReports();
    this.cashRegisterService.loadCashRegisters();
    this.sessionService.loadSessions();
  }

  // Refresh approvals data
  refreshApprovals() {
    this.loadData();
  }

  // Export approvals
  exportApprovals() {
    // Implementation for exporting approvals
    console.log('Exporting approvals...');
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

  // Approval Request Management
  openApprovalModal(request: ApprovalRequest) {
    this.selectedRequest = request;
    this.approvalForm.reset();
    this.showApprovalModal = true;
  }

  closeApprovalModal() {
    this.showApprovalModal = false;
    this.selectedRequest = null;
    this.approvalForm.reset();
  }

  async approveRequest() {
    if (!this.selectedRequest || !this.approvalForm.valid) return;
    
    try {
      await this.approvalService.approveRequest(
        this.selectedRequest.id!,
        1, // Current manager ID - in real app, get from auth service
        this.approvalForm.value.comments
      );
      this.closeApprovalModal();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  }

  async rejectRequest() {
    if (!this.selectedRequest || !this.approvalForm.valid) return;
    
    try {
      await this.approvalService.rejectRequest(
        this.selectedRequest.id!,
        1, // Current manager ID - in real app, get from auth service
        this.approvalForm.value.comments
      );
      this.closeApprovalModal();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  }

  // Approval Rules Management
  openRuleModal(rule?: ApprovalRule) {
    this.selectedRule = rule || null;
    if (rule) {
      this.ruleForm.patchValue({
        name: rule.name,
        description: rule.description,
        type: rule.type,
        autoApprove: rule.autoApprove,
        requireManagerApproval: rule.requireManagerApproval,
        isActive: rule.isActive
      });
    } else {
      this.ruleForm.reset({
        autoApprove: false,
        requireManagerApproval: true,
        isActive: true
      });
    }
    this.showRuleModal = true;
  }

  closeRuleModal() {
    this.showRuleModal = false;
    this.selectedRule = null;
    this.ruleForm.reset();
  }

  async saveRule() {
    if (!this.ruleForm.valid) return;
    
    try {
      const ruleData = this.ruleForm.value;
      
      if (this.selectedRule) {
        await this.approvalService.updateApprovalRule(this.selectedRule.id!, ruleData);
      } else {
        await this.approvalService.createApprovalRule({
          ...ruleData,
          conditions: [] // In a real app, you'd have a UI to configure conditions
        });
      }
      
      this.closeRuleModal();
    } catch (error) {
      console.error('Error saving rule:', error);
    }
  }

  // Discrepancy Management
  openDiscrepancyModal(discrepancy: DiscrepancyReport) {
    this.selectedDiscrepancy = discrepancy;
    this.discrepancyForm.reset();
    this.showDiscrepancyModal = true;
  }

  closeDiscrepancyModal() {
    this.showDiscrepancyModal = false;
    this.selectedDiscrepancy = null;
    this.discrepancyForm.reset();
  }

  async resolveDiscrepancy() {
    if (!this.selectedDiscrepancy || !this.discrepancyForm.valid) return;
    
    try {
      await this.approvalService.resolveDiscrepancy(
        this.selectedDiscrepancy.id!,
        1, // Current manager ID - in real app, get from auth service
        this.discrepancyForm.value.resolution
      );
      this.closeDiscrepancyModal();
    } catch (error) {
      console.error('Error resolving discrepancy:', error);
    }
  }

  // Export methods
  exportApprovalRequests() {
    const requests = this.approvalService.approvalRequests();
    const exportData = requests.map(request => ({
      'ID': request.id,
      'Type': request.type,
      'Cash Register ID': request.cashRegisterId,
      'Amount': request.amount,
      'Description': request.description,
      'Requested By': request.requestedBy,
      'Requested At': request.requestedAt.toISOString().split('T')[0],
      'Status': request.status,
      'Priority': request.priority,
      'Approved By': request.approvedBy || 'N/A',
      'Approved At': request.approvedAt ? request.approvedAt.toISOString().split('T')[0] : 'N/A',
      'Comments': request.comments || 'N/A'
    }));
    this.exportToCSV(exportData, 'approval-requests');
  }

  exportDiscrepancyReports() {
    const reports = this.approvalService.discrepancyReports();
    const exportData = reports.map(report => ({
      'ID': report.id,
      'Session ID': report.sessionId,
      'Cash Register ID': report.cashRegisterId,
      'Expected Balance': report.expectedBalance,
      'Actual Balance': report.actualBalance,
      'Discrepancy': report.discrepancy,
      'Discrepancy %': report.discrepancyPercentage.toFixed(2),
      'Status': report.status,
      'Reported By': report.reportedBy,
      'Reported At': report.reportedAt.toISOString().split('T')[0],
      'Resolved By': report.resolvedBy || 'N/A',
      'Resolved At': report.resolvedAt ? report.resolvedAt.toISOString().split('T')[0] : 'N/A',
      'Resolution': report.resolution || 'N/A'
    }));
    this.exportToCSV(exportData, 'discrepancy-reports');
  }

  private exportToCSV(data: any[], filename: string) {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }
        return `"${value}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      case 'investigating':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      case 'resolved':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  }

  getTypeClass(type: string): string {
    switch (type.toLowerCase()) {
      case 'session_close':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      case 'discrepancy':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'large_movement':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300';
      case 'negative_balance':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  }

  getCashRegisterName(cashRegisterId: number): string {
    const cashRegister = this.cashRegisterService.cashRegisters().find(cr => cr.id === cashRegisterId);
    return cashRegister?.name || `Cash Register ${cashRegisterId}`;
  }

  getSessionInfo(sessionId?: number): string {
    if (!sessionId) return 'N/A';
    return `Session ${sessionId}`;
  }

  getDiscrepancyClass(discrepancy: number): string {
    if (discrepancy > 0) {
      return 'text-green-600 dark:text-green-400';
    } else if (discrepancy < 0) {
      return 'text-red-600 dark:text-red-400';
    } else {
      return 'text-gray-600 dark:text-gray-400';
    }
  }

  getDiscrepancySeverity(discrepancy: number, percentage: number): string {
    const absPercentage = Math.abs(percentage);
    if (absPercentage > 10) return 'Critical';
    if (absPercentage > 5) return 'High';
    if (absPercentage > 2) return 'Medium';
    return 'Low';
  }

  getDiscrepancySeverityClass(discrepancy: number, percentage: number): string {
    const absPercentage = Math.abs(percentage);
    if (absPercentage > 10) return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
    if (absPercentage > 5) return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300';
    if (absPercentage > 2) return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
    return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
  }

  getTimeFromDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString();
  }
}
