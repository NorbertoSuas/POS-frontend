import { Injectable, signal, computed } from '@angular/core';
import { CashRegisterSessionService } from './cash-register-session.service';
import { CashRegisterMovementService } from './cash-register-movement.service';
import { CashRegisterService } from './cash-register.service';


export interface ApprovalRequest {
  id?: number;
  type: 'session_close' | 'discrepancy' | 'large_movement' | 'negative_balance';
  cashRegisterId: number;
  sessionId?: number;
  movementId?: number;
  amount: number;
  description: string;
  requestedBy: number; // Employee ID
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: number; // Manager ID
  approvedAt?: Date;
  comments?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ApprovalRule {
  id?: number;
  name: string;
  description: string;
  type: 'session_close' | 'discrepancy' | 'large_movement' | 'negative_balance';
  conditions: ApprovalCondition[];
  autoApprove: boolean;
  requireManagerApproval: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApprovalCondition {
  field: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'greater_than_or_equal' | 'less_than_or_equal';
  value: number | string;
}

export interface DiscrepancyReport {
  id?: number;
  sessionId: number;
  cashRegisterId: number;
  expectedBalance: number;
  actualBalance: number;
  discrepancy: number;
  discrepancyPercentage: number;
  status: 'pending' | 'investigating' | 'resolved' | 'approved';
  reportedBy: number;
  reportedAt: Date;
  resolvedBy?: number;
  resolvedAt?: Date;
  resolution?: string;
  approvalRequestId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CashRegisterApprovalService {
  private readonly _loading = signal(false);
  private readonly _approvalRequests = signal<ApprovalRequest[]>([]);
  private readonly _approvalRules = signal<ApprovalRule[]>([]);
  private readonly _discrepancyReports = signal<DiscrepancyReport[]>([]);

  // Signals
  loading = this._loading.asReadonly();
  approvalRequests = this._approvalRequests.asReadonly();
  approvalRules = this._approvalRules.asReadonly();
  discrepancyReports = this._discrepancyReports.asReadonly();

  // Computed values
  pendingApprovals = computed(() => 
    this._approvalRequests().filter(req => req.status === 'pending')
  );

  highPriorityApprovals = computed(() => 
    this._approvalRequests().filter(req => 
      req.status === 'pending' && (req.priority === 'high' || req.priority === 'urgent')
    )
  );

  activeApprovalRules = computed(() => 
    this._approvalRules().filter(rule => rule.isActive)
  );

  pendingDiscrepancies = computed(() => 
    this._discrepancyReports().filter(report => 
      report.status === 'pending' || report.status === 'investigating'
    )
  );

  constructor(
    private readonly sessionService: CashRegisterSessionService,
    private readonly movementService: CashRegisterMovementService,
    private readonly cashRegisterService: CashRegisterService
  ) {
    this.initializeDefaultRules();
  }

  // Approval Request Management
  async loadApprovalRequests() {
    this._loading.set(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Initialize with empty array
      this._approvalRequests.set([]);
    } catch (error) {
      console.error('Error loading approval requests:', error);
    } finally {
      this._loading.set(false);
    }
  }

  async createApprovalRequest(request: Omit<ApprovalRequest, 'id' | 'requestedAt' | 'status'>) {
    this._loading.set(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newRequest: ApprovalRequest = {
        ...request,
        id: Date.now(),
        requestedAt: new Date(),
        status: 'pending'
      };
      
      this._approvalRequests.update(requests => [...requests, newRequest]);
      return newRequest;
    } catch (error) {
      console.error('Error creating approval request:', error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async approveRequest(requestId: number, approvedBy: number, comments?: string) {
    this._loading.set(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this._approvalRequests.update(requests => 
        requests.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: 'approved' as const, 
                approvedBy, 
                approvedAt: new Date(),
                comments 
              }
            : req
        )
      );
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async rejectRequest(requestId: number, approvedBy: number, comments: string) {
    this._loading.set(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this._approvalRequests.update(requests => 
        requests.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: 'rejected' as const, 
                approvedBy, 
                approvedAt: new Date(),
                comments 
              }
            : req
        )
      );
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // Approval Rules Management
  async loadApprovalRules() {
    this._loading.set(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Rules are already initialized in constructor
    } catch (error) {
      console.error('Error loading approval rules:', error);
    } finally {
      this._loading.set(false);
    }
  }

  async createApprovalRule(rule: Omit<ApprovalRule, 'id' | 'createdAt' | 'updatedAt'>) {
    this._loading.set(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newRule: ApprovalRule = {
        ...rule,
        id: Date.now(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this._approvalRules.update(rules => [...rules, newRule]);
      return newRule;
    } catch (error) {
      console.error('Error creating approval rule:', error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async updateApprovalRule(ruleId: number, updates: Partial<ApprovalRule>) {
    this._loading.set(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this._approvalRules.update(rules => 
        rules.map(rule => 
          rule.id === ruleId 
            ? { ...rule, ...updates, updatedAt: new Date() }
            : rule
        )
      );
    } catch (error) {
      console.error('Error updating approval rule:', error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // Discrepancy Management
  async loadDiscrepancyReports() {
    this._loading.set(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Initialize with empty array
      this._discrepancyReports.set([]);
    } catch (error) {
      console.error('Error loading discrepancy reports:', error);
    } finally {
      this._loading.set(false);
    }
  }

  async createDiscrepancyReport(report: Omit<DiscrepancyReport, 'id' | 'reportedAt' | 'discrepancy' | 'discrepancyPercentage'>) {
    this._loading.set(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const discrepancy = report.actualBalance - report.expectedBalance;
      const discrepancyPercentage = (discrepancy / report.expectedBalance) * 100;
      
      const newReport: DiscrepancyReport = {
        ...report,
        id: Date.now(),
        reportedAt: new Date(),
        discrepancy,
        discrepancyPercentage
      };
      
      this._discrepancyReports.update(reports => [...reports, newReport]);
      
      // Check if approval is required
      await this.checkApprovalRequirements(newReport);
      
      return newReport;
    } catch (error) {
      console.error('Error creating discrepancy report:', error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async resolveDiscrepancy(reportId: number, resolvedBy: number, resolution: string) {
    this._loading.set(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this._discrepancyReports.update(reports => 
        reports.map(report => 
          report.id === reportId 
            ? { 
                ...report, 
                status: 'resolved' as const, 
                resolvedBy, 
                resolvedAt: new Date(),
                resolution 
              }
            : report
        )
      );
    } catch (error) {
      console.error('Error resolving discrepancy:', error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // Business Logic
  async checkApprovalRequirements(discrepancy: DiscrepancyReport) {
    const rules = this.activeApprovalRules();
    const applicableRules = rules.filter(rule => rule.type === 'discrepancy');
    
    for (const rule of applicableRules) {
      if (this.evaluateRule(rule, discrepancy)) {
        if (rule.autoApprove) {
          // Auto-approve if rule allows
          continue;
        } else if (rule.requireManagerApproval) {
          // Create approval request
          await this.createApprovalRequest({
            type: 'discrepancy',
            cashRegisterId: discrepancy.cashRegisterId,
            sessionId: discrepancy.sessionId,
            amount: Math.abs(discrepancy.discrepancy),
            description: `Discrepancy of ${discrepancy.discrepancy} in session ${discrepancy.sessionId}`,
            requestedBy: discrepancy.reportedBy,
            priority: this.calculatePriority(discrepancy)
          });
        }
      }
    }
  }

  private evaluateRule(rule: ApprovalRule, data: any): boolean {
    return rule.conditions.every(condition => {
      const fieldValue = this.getFieldValue(data, condition.field);
      return this.evaluateCondition(fieldValue, condition.operator, condition.value);
    });
  }

  private getFieldValue(data: any, field: string): any {
    const fields = field.split('.');
    let value = data;
    for (const f of fields) {
      value = value?.[f];
    }
    return value;
  }

  private evaluateCondition(fieldValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'greater_than':
        return fieldValue > expectedValue;
      case 'less_than':
        return fieldValue < expectedValue;
      case 'equals':
        return fieldValue === expectedValue;
      case 'greater_than_or_equal':
        return fieldValue >= expectedValue;
      case 'less_than_or_equal':
        return fieldValue <= expectedValue;
      default:
        return false;
    }
  }

  private calculatePriority(discrepancy: DiscrepancyReport): 'low' | 'medium' | 'high' | 'urgent' {
    const absDiscrepancy = Math.abs(discrepancy.discrepancy);
    const absPercentage = Math.abs(discrepancy.discrepancyPercentage);
    
    if (absPercentage > 10 || absDiscrepancy > 500) {
      return 'urgent';
    } else if (absPercentage > 5 || absDiscrepancy > 200) {
      return 'high';
    } else if (absPercentage > 2 || absDiscrepancy > 50) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private initializeDefaultRules() {
    const defaultRules: ApprovalRule[] = [
      {
        id: 1,
        name: 'Large Movement Approval',
        description: 'Require approval for movements over $1000',
        type: 'large_movement',
        conditions: [
          { field: 'amount', operator: 'greater_than', value: 1000 }
        ],
        autoApprove: false,
        requireManagerApproval: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Significant Discrepancy',
        description: 'Require approval for discrepancies over 5% or $100',
        type: 'discrepancy',
        conditions: [
          { field: 'discrepancyPercentage', operator: 'greater_than', value: 5 }
        ],
        autoApprove: false,
        requireManagerApproval: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Negative Balance Prevention',
        description: 'Prevent negative cash register balances',
        type: 'negative_balance',
        conditions: [
          { field: 'balance', operator: 'less_than', value: 0 }
        ],
        autoApprove: false,
        requireManagerApproval: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    this._approvalRules.set(defaultRules);
  }

  // Utility methods
  getApprovalRequestById(id: number): ApprovalRequest | undefined {
    return this._approvalRequests().find(req => req.id === id);
  }

  getDiscrepancyReportById(id: number): DiscrepancyReport | undefined {
    return this._discrepancyReports().find(report => report.id === id);
  }

  getApprovalRequestsByType(type: ApprovalRequest['type']): ApprovalRequest[] {
    return this._approvalRequests().filter(req => req.type === type);
  }

  getDiscrepancyReportsByStatus(status: DiscrepancyReport['status']): DiscrepancyReport[] {
    return this._discrepancyReports().filter(report => report.status === status);
  }
}
