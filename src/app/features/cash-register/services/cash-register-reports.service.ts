import { Injectable, signal, computed } from '@angular/core';
import { CashRegisterService } from './cash-register.service';
import { CashRegisterSessionService } from './cash-register-session.service';
import { CashRegisterMovementService } from './cash-register-movement.service';
import { CashRegister, CashRegisterSession, CashRegisterMovement } from '../models';

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  cashRegisterIds: number[];
  movementTypeIds: number[];
  sessionStatuses: string[];
}

export interface CashRegisterReport {
  cashRegister: CashRegister;
  totalSessions: number;
  activeSessions: number;
  totalMovements: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  averageSessionDuration: number;
  lastActivity: Date | null;
}

export interface SessionReport {
  session: CashRegisterSession;
  cashRegisterName: string;
  totalMovements: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  duration: number;
  discrepancy: number;
}

export interface MovementReport {
  date: Date;
  cashRegisterName: string;
  movementType: string;
  category: string;
  amount: number;
  description: string;
  reference: string;
}

export interface AnalyticsData {
  totalCashRegisters: number;
  activeSessions: number;
  totalMovements: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  averageSessionDuration: number;
  topPerformingCashRegister: CashRegister | null;
  recentActivity: MovementReport[];
  dailySummary: DailySummary[];
}

export interface DailySummary {
  date: Date;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  sessionCount: number;
  movementCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CashRegisterReportsService {
  private readonly _loading = signal(false);
  private readonly _filters = signal<ReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    endDate: new Date(),
    cashRegisterIds: [],
    movementTypeIds: [],
    sessionStatuses: []
  });

  // Signals
  loading = this._loading.asReadonly();
  filters = this._filters.asReadonly();

  // Computed values
  cashRegisterReports = computed(() => this.generateCashRegisterReports());
  sessionReports = computed(() => this.generateSessionReports());
  movementReports = computed(() => this.generateMovementReports());
  analyticsData = computed(() => this.generateAnalyticsData());

  constructor(
    private readonly cashRegisterService: CashRegisterService,
    private readonly sessionService: CashRegisterSessionService,
    private readonly movementService: CashRegisterMovementService
  ) {}

  // Filter management
  updateFilters(filters: Partial<ReportFilters>) {
    this._filters.update(current => ({ ...current, ...filters }));
  }

  resetFilters() {
    this._filters.set({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      cashRegisterIds: [],
      movementTypeIds: [],
      sessionStatuses: []
    });
  }

  // Report generation
  private generateCashRegisterReports(): CashRegisterReport[] {
    const filters = this._filters();
    const cashRegisters = this.cashRegisterService.cashRegisters();
    const sessions = this.sessionService.sessions();
    const movements = this.movementService.movements();

    return cashRegisters
      .filter(cr => filters.cashRegisterIds.length === 0 || filters.cashRegisterIds.includes(cr.id!))
      .map(cashRegister => {
        const cashRegisterSessions = sessions.filter(s => s.cashRegisterId === cashRegister.id);
        const cashRegisterMovements = movements.filter(m => m.cashRegisterId === cashRegister.id);

        const filteredSessions = cashRegisterSessions.filter(session => {
          const sessionDate = new Date(session.openDate);
          return sessionDate >= filters.startDate && sessionDate <= filters.endDate;
        });

        const filteredMovements = cashRegisterMovements.filter(movement => {
          const movementDate = new Date(movement.movementDate);
          return movementDate >= filters.startDate && movementDate <= filters.endDate;
        });

        const totalIncome = filteredMovements
          .filter(m => this.getMovementCategory(m.movementTypeId) === 'income')
          .reduce((sum, m) => sum + m.amount, 0);

        const totalExpenses = filteredMovements
          .filter(m => this.getMovementCategory(m.movementTypeId) === 'expense')
          .reduce((sum, m) => sum + m.amount, 0);

        const totalSessions = filteredSessions.length;
        const activeSessions = filteredSessions.filter(s => s.status === 'Open').length;

        const averageSessionDuration = this.calculateAverageSessionDuration(filteredSessions);
        const lastActivity = this.getLastActivity(filteredMovements);

        return {
          cashRegister,
          totalSessions,
          activeSessions,
          totalMovements: filteredMovements.length,
          totalIncome,
          totalExpenses,
          netBalance: totalIncome - totalExpenses,
          averageSessionDuration,
          lastActivity
        };
      });
  }

  private generateSessionReports(): SessionReport[] {
    const filters = this._filters();
    const sessions = this.sessionService.sessions();
    const movements = this.movementService.movements();
    const cashRegisters = this.cashRegisterService.cashRegisters();

    return sessions
      .filter(session => {
        const sessionDate = new Date(session.openDate);
        const matchesDate = sessionDate >= filters.startDate && sessionDate <= filters.endDate;
        const matchesCashRegister = filters.cashRegisterIds.length === 0 || 
          filters.cashRegisterIds.includes(session.cashRegisterId);
        const matchesStatus = filters.sessionStatuses.length === 0 || 
          filters.sessionStatuses.includes(session.status);
        
        return matchesDate && matchesCashRegister && matchesStatus;
      })
      .map(session => {
        const cashRegister = cashRegisters.find(cr => cr.id === session.cashRegisterId);
        const sessionMovements = movements.filter(m => 
          m.cashRegisterId === session.cashRegisterId &&
          new Date(m.movementDate) >= new Date(session.openDate) &&
          (session.closeDate ? new Date(m.movementDate) <= new Date(session.closeDate) : true)
        );

        const totalIncome = sessionMovements
          .filter(m => this.getMovementCategory(m.movementTypeId) === 'income')
          .reduce((sum, m) => sum + m.amount, 0);

        const totalExpenses = sessionMovements
          .filter(m => this.getMovementCategory(m.movementTypeId) === 'expense')
          .reduce((sum, m) => sum + m.amount, 0);

        const netBalance = totalIncome - totalExpenses;
        const duration = this.calculateSessionDuration(session);
        const discrepancy = session.closeDate ? 
          (session.closingBalance || 0) - (session.openingBalance + netBalance) : 0;

        return {
          session,
          cashRegisterName: cashRegister?.name || 'Unknown',
          totalMovements: sessionMovements.length,
          totalIncome,
          totalExpenses,
          netBalance,
          duration,
          discrepancy
        };
      });
  }

  private generateMovementReports(): MovementReport[] {
    const filters = this._filters();
    const movements = this.movementService.movements();
    const cashRegisters = this.cashRegisterService.cashRegisters();
    const movementTypes = this.movementService.movementTypes();

    return movements
      .filter(movement => {
        const movementDate = new Date(movement.movementDate);
        const matchesDate = movementDate >= filters.startDate && movementDate <= filters.endDate;
        const matchesCashRegister = filters.cashRegisterIds.length === 0 || 
          filters.cashRegisterIds.includes(movement.cashRegisterId);
        const matchesMovementType = filters.movementTypeIds.length === 0 || 
          filters.movementTypeIds.includes(movement.movementTypeId);
        
        return matchesDate && matchesCashRegister && matchesMovementType;
      })
      .map(movement => {
        const cashRegister = cashRegisters.find(cr => cr.id === movement.cashRegisterId);
        const movementType = movementTypes.find(mt => mt.id === movement.movementTypeId);

        return {
          date: new Date(movement.movementDate),
          cashRegisterName: cashRegister?.name || 'Unknown',
          movementType: movementType?.name || 'Unknown',
          category: this.getMovementCategory(movement.movementTypeId),
          amount: movement.amount,
          description: movement.description || '',
          reference: movement.reference || ''
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private generateAnalyticsData(): AnalyticsData {
    const cashRegisters = this.cashRegisterService.cashRegisters();
    const sessions = this.sessionService.sessions();
    const movements = this.movementService.movements();
    const cashRegisterReports = this.cashRegisterReports();

    const totalIncome = movements
      .filter(m => this.getMovementCategory(m.movementTypeId) === 'income')
      .reduce((sum, m) => sum + m.amount, 0);

    const totalExpenses = movements
      .filter(m => this.getMovementCategory(m.movementTypeId) === 'expense')
      .reduce((sum, m) => sum + m.amount, 0);

    const activeSessions = sessions.filter(s => s.status === 'Open').length;
    const averageSessionDuration = this.calculateAverageSessionDuration(sessions);

    const sortedReports = [...cashRegisterReports].sort((a, b) => b.netBalance - a.netBalance);
    const topPerformingCashRegister = sortedReports[0]?.cashRegister || null;

    const recentActivity = this.generateMovementReports()
      .slice(0, 10);

    const dailySummary = this.generateDailySummary();

    return {
      totalCashRegisters: cashRegisters.length,
      activeSessions,
      totalMovements: movements.length,
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      averageSessionDuration,
      topPerformingCashRegister,
      recentActivity,
      dailySummary
    };
  }

  private generateDailySummary(): DailySummary[] {
    const filters = this._filters();
    const movements = this.movementService.movements();
    const sessions = this.sessionService.sessions();
    
    const dailyData = new Map<string, DailySummary>();
    
    // Initialize all days in range
    const currentDate = new Date(filters.startDate);
    while (currentDate <= filters.endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dailyData.set(dateKey, {
        date: new Date(currentDate),
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        sessionCount: 0,
        movementCount: 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Process movements
    movements.forEach(movement => {
      const movementDate = new Date(movement.movementDate);
      if (movementDate >= filters.startDate && movementDate <= filters.endDate) {
        const dateKey = movementDate.toISOString().split('T')[0];
        const dayData = dailyData.get(dateKey);
        if (dayData) {
          dayData.movementCount++;
          if (this.getMovementCategory(movement.movementTypeId) === 'income') {
            dayData.totalIncome += movement.amount;
          } else if (this.getMovementCategory(movement.movementTypeId) === 'expense') {
            dayData.totalExpenses += movement.amount;
          }
          dayData.netBalance = dayData.totalIncome - dayData.totalExpenses;
        }
      }
    });

    // Process sessions
    sessions.forEach(session => {
      const sessionDate = new Date(session.openDate);
      if (sessionDate >= filters.startDate && sessionDate <= filters.endDate) {
        const dateKey = sessionDate.toISOString().split('T')[0];
        const dayData = dailyData.get(dateKey);
        if (dayData) {
          dayData.sessionCount++;
        }
      }
    });

    return Array.from(dailyData.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Helper methods
  private getMovementCategory(movementTypeId: number): string {
    const movementType = this.movementService.movementTypes().find(mt => mt.id === movementTypeId);
    return movementType?.category || 'unknown';
  }

  private calculateAverageSessionDuration(sessions: CashRegisterSession[]): number {
    const closedSessions = sessions.filter(s => s.closeDate);
    if (closedSessions.length === 0) return 0;

    const totalDuration = closedSessions.reduce((sum, session) => {
      return sum + this.calculateSessionDuration(session);
    }, 0);

    return totalDuration / closedSessions.length;
  }

  private calculateSessionDuration(session: CashRegisterSession): number {
    const openDate = new Date(session.openDate);
    const closeDate = session.closeDate ? new Date(session.closeDate) : new Date();
    return closeDate.getTime() - openDate.getTime();
  }

  private getLastActivity(movements: CashRegisterMovement[]): Date | null {
    if (movements.length === 0) return null;
    return new Date(Math.max(...movements.map(m => new Date(m.movementDate).getTime())));
  }

  // Export methods
  exportToCSV(data: any[], filename: string) {
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

  exportToExcel(data: any[], filename: string) {
    // This would require a library like xlsx
    // For now, we'll use CSV export
    this.exportToCSV(data, filename);
  }
}
