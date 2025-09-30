export const CASH_REGISTER_CONFIG = {
  // API Configuration
  api: {
    endpoints: {
      cashRegisters: '/api/CashRegisters',
      sessions: '/api/CashRegisterSessions',
      movements: '/api/CashRegisterMovements',
      approvals: '/api/CashRegisterSessionApprovals'
    },
    refreshInterval: 30000, // 30 seconds
    retryAttempts: 3
  },

  // UI Configuration
  ui: {
    refreshInterval: 30000,
    maxAmount: 999999.99,
    minAmount: 0.01,
    decimalPlaces: 2,
    itemsPerPage: 20
  },

  // Business Logic Configuration
  business: {
    maxDiscrepancyAmount: 100.00, // Maximum amount without approval
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    requireApproval: true,
    allowNegativeBalance: false,
    maxInitialBalance: 10000.00
  },

  // Status Configuration
  status: {
    available: 'Available',
    inUse: 'In Use',
    suspended: 'Suspended',
    maintenance: 'Maintenance',
    inactive: 'Inactive'
  },

  // Movement Types Configuration
  movementTypes: {
    sale: 'SALE',
    income: 'INCOME',
    expense: 'EXPENSE',
    refund: 'REFUND',
    transfer: 'TRANSFER'
  },

  // Validation Rules
  validation: {
    name: {
      minLength: 3,
      maxLength: 50
    },
    description: {
      maxLength: 255
    },
    amount: {
      min: 0.01,
      max: 999999.99
    }
  }
};

