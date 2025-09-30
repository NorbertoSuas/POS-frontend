export const environment = {
  production: false,
  accessKey: 'IBODACCESSKEY',
  accessSecret: 'QWERTY0987654321xyz&.$',
  api: {
    baseUrl: 'http://localhost:3002/v1.0',

    token: {
      prefix: '/token',
      endpoints: {
        getToken: '/get-token',
      },
    },

    auth: {
      prefix: '/authentication',
      endpoints: {
        login: '/login',
        logout: '/logout',
      },
    },

    users: {
      prefix: '/users',

      users: {
        prefix: '/users',
        endpoints: {
          getAll: '/',
          getAllUsersTableRow: '/users-table-row',
          getById: (id: string) => `/${id}`,
          getUserDtoById: (id: string) => `/${id}/user-dto`,
          upsert: '/',
          update: (id: string) => `/${id}`,
          delete: (id: string) => `/${id}`,
        },
      },

      employee: {
        prefix: '/employee',
        endpoints: {
          getAll: '/',
          getById: (id: string) => `/${id}`,
          upsert: '/',
          update: (id: string) => `/${id}`,
          delete: (id: string) => `/${id}`,
        },
      },

      roles: {
        prefix: '/roles',
        endpoints: {
          getAll: '/',
          getById: (id: string) => `/${id}`,
          getRolePermissionsById: (id: string) => `/${id}/permissions`,
          create: '/',
          update: (id: string) => `/${id}`,
          delete: (id: string) => `/${id}`,
          assignPermissions: (roleId: string) => `/${roleId}/permissions`,
        },
      },

      permissions: {
        prefix: '/permissions',
        endpoints: {
          getAll: '',
          getById: (id: string) => `/${id}`,
          create: '',
          update: (id: string) => `/${id}`,
          delete: (id: string) => `/${id}`,
        },
      },
    },
    inventory: {
      prefix: '/inventory',

      prices: {
        prefix: '/prices',
        endpoints: {
          list: '/',
          getById: (id: string) => `/${id}`,
          create: '/',
          update: (id: string) => `/${id}`,
          delete: (id: string) => `/${id}`,
        },
      },

      productPrices: {
        prefix: '/product-prices',
        endpoints: {
          list: '/',
          getById: (id: string) => `/${id}`,
          create: '/',
          update: (id: string) => `/${id}`,
          delete: (id: string) => `/${id}`,
          assignPrice: (productId: string) => `/${productId}/assign-price`,
        },
      },

      productTypes: {
        prefix: '/product-type',
        endpoints: {
          getAll: '/',
          getById: (id: string) => `/${id}`,
          create: '/',
          update: (id: string) => `/${id}`,
          delete: (id: string) => `/${id}`,
        },
      },

      productTaxes: {
        prefix: '/product-taxes',
        endpoints: {
          list: '/',
          getById: (id: string) => `/${id}`,
          create: '/',
          update: (id: string) => `/${id}`,
          delete: (id: string) => `/${id}`,
        },
      },

      taxes: {
        prefix: '/taxes',
        endpoints: {
          list: '/',
          getById: (id: string) => `/${id}`,
          create: '/',
          update: (id: string) => `/${id}`,
          delete: (id: string) => `/${id}`,
          upsert: '/',
        },
      },

      suppliers: {
        prefix: '/suppliers',
        endpoints: {
          list: '/',
          getById: (id: string) => `/${id}`,
          create: '/',
          update: (id: string) => `/${id}`,
          delete: (id: string) => `/${id}`,
        },
      },

      warehouses: {
        prefix: '/warehouses',
        endpoints: {
          list: '/',
          getById: (id: string) => `/${id}`,
          create: '/',
          update: (id: string) => `/${id}`,
          delete: (id: string) => `/${id}`,
        },
      },

      storageTypes: {
        prefix: '/storage-types',
        endpoints: {
          list: '/',
          getById: (id: string) => `/${id}`,
          create: '/',
          update: (id: string) => `/${id}`,
          delete: (id: string) => `/${id}`,
        },
      },

      detailStorageTypes: {
        prefix: '/detail-storage-types',
        endpoints: {
          list: '/',
          getById: (id: string) => `/${id}`,
          create: '/',
          update: (id: string) => `/${id}`,
          delete: (id: string) => `/${id}`,
        },
      },

      inventories: {
        prefix: '/inventories',
        endpoints: {
          list: '/',
          getById: (id: string) => `/${id}`,
          create: '/',
          update: (id: string) => `/${id}`,
          delete: (id: string) => `/${id}`,
        },
      },

      inventoryMovements: {
        prefix: '/inventory-movements',
        endpoints: {
          list: '/',
          getById: (id: string) => `/${id}`,
          create: '/',
          update: (id: string) => `/${id}`,
          delete: (id: string) => `/${id}`,
        },
      },

      movementTypes: {
        prefix: '/movement-types',
        endpoints: {
          list: '/',
          getById: (id: string) => `/${id}`,
          create: '/',
          update: (id: string) => `/${id}`,
          delete: (id: string) => `/${id}`,
        },
      },

      products: {
        prefix: '/products',
        endpoints: {
          list: '/',
          getById: (id: string) => `/${id}`,
          create: '/',
          update: (id: string) => `/${id}`,
          delete: (id: string) => `/${id}`,
          categories: '/categories'
        }
      },

      storage: {
        prefix: '/storage',
        endpoints: {
          list: '/',
          getById: (id: string) => `/${id}`,
          create: '/',
          update: (id: string) => `/${id}`,
          delete: (id: string) => `/${id}`
        }
      },
    },

    orders: {
      prefix: '/orders',
      orders: {
        prefix: '/orders',
        endpoints: {
          list: '/',
          getById: (id: string) => `/${id}`,
          create: '/',
          update: (id: string) => `/${id}`,
          cancel: (id: string) => `/${id}/cancel`,
          getAllProductItem: '/product-items',
        },
      },
      ordersTypes: {
        prefix: '/order-types',
        endpoints: {
          getAll: '/',
          getById: (id: string) => `/${id}`,
          create: '/',
          update: (id: string) => `/${id}`,
          cancel: (id: string) => `/${id}/cancel`
        },
      },
      orderSale: {
        prefix: '/order-sale',
        endpoints: {
          getAll: '/',
          getById: (id: string) => `/${id}`,
          create: '/',
          update: (id: string) => `/${id}`,
          cancel: (id: string) => `/${id}/cancel`
        },
      }
    },
    cashRegister: {
      prefix: '/cash-register',
      endpoints: {
        status: '/status',
        open: '/open',
        close: '/close',
        transaction: '/transaction',
      },
    },

    audit: {
      prefix: '/auditlogs',
      endpoints: {
        list: '/',
        getById: (id: string) => `/${id}`,
        create: '/',
        update: (id: string) => `/${id}`,
        delete: (id: string) => `/${id}`,
        search: '/search',
        byUser: '/user',
        byEntity: '/entity',
        byDateRange: '/daterange',
        export: '/export'
      }
    },

    // …otros dominios
  },
};
