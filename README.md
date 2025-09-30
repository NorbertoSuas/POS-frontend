# POS Frontend - Sistema de Punto de Venta

Una aplicación web moderna desarrollada en Angular para la gestión completa de un sistema de punto de venta (POS) con funcionalidades avanzadas de inventario, caja registradora, órdenes y auditoría.

## 🚀 Características Principales

### 🔐 Autenticación y Autorización
- Sistema de login seguro con JWT
- Control de acceso basado en roles (Admin, Cajero, Inventory Manager)
- Guards de autenticación y autorización
- Gestión de sesiones de usuario

### 💰 Gestión de Caja Registradora
- Apertura y cierre de caja
- Control de movimientos de efectivo
- Aprobaciones de transacciones
- Reportes financieros detallados
- Dashboard para cajeros

### 📦 Gestión de Inventario
- Control completo de productos y categorías
- Gestión de almacenes y tipos de almacenamiento
- Movimientos de inventario (entradas, salidas, transferencias)
- Control de precios y descuentos
- Gestión de proveedores
- Control de impuestos por producto

### 🛒 Sistema de Órdenes
- Creación y gestión de órdenes
- Múltiples tipos de órdenes
- Gestión de mesas
- Selección de productos con extras
- Procesamiento de pagos
- Estados de órdenes en tiempo real

### 👥 Gestión de Usuarios
- Administración de empleados
- Gestión de roles y permisos
- Perfiles de usuario personalizables
- Control de acceso granular

### 📊 Auditoría y Reportes
- Logs de auditoría completos
- Filtros avanzados de búsqueda
- Exportación de datos
- Trazabilidad de todas las operaciones

## 🛠️ Stack Tecnológico

### Frontend
- **Angular 20** - Framework principal
- **TypeScript 5.8** - Lenguaje de programación
- **Tailwind CSS 4.1** - Framework de estilos
- **DaisyUI 5.0** - Componentes UI
- **Lucide Angular** - Iconografía
- **RxJS 7.8** - Programación reactiva

### Herramientas de Desarrollo
- **Angular CLI 20** - Herramientas de desarrollo
- **Karma & Jasmine** - Testing
- **PostCSS** - Procesamiento de CSS
- **Prettier** - Formateo de código

### Funcionalidades Adicionales
- **File Saver** - Exportación de archivos
- **XLSX** - Manejo de hojas de cálculo
- **Responsive Design** - Diseño adaptable
- **Dark Mode** - Tema oscuro/claro

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Servicios centrales y guards
│   ├── features/                # Módulos de funcionalidades
│   │   ├── admin-panel/         # Panel de administración
│   │   ├── auth/               # Autenticación
│   │   ├── audit/              # Sistema de auditoría
│   │   ├── cash-register/      # Gestión de caja
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── inventory/          # Gestión de inventario
│   │   ├── order/              # Sistema de órdenes
│   │   └── user/               # Gestión de usuarios
│   ├── shared/                 # Componentes compartidos
│   └── environments/           # Configuración de entornos
├── assets/                     # Recursos estáticos
└── styles.css                  # Estilos globales
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn
- Angular CLI 20

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd POS-frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   - Editar `src/environments/environment.ts`
   - Configurar la URL del backend API
   - Configurar claves de acceso

4. **Ejecutar en modo desarrollo**
   ```bash
   npm start
   ```

5. **Acceder a la aplicación**
   - Abrir navegador en `http://localhost:4200`

### Scripts Disponibles

```bash
# Desarrollo
npm start                    # Servidor de desarrollo
npm run build               # Build de producción
npm run watch               # Build con watch mode

# Testing
npm test                    # Ejecutar tests unitarios

# Utilidades
ng generate component       # Generar componente
ng generate service         # Generar servicio
ng generate guard           # Generar guard
```

## 🔧 Configuración del Backend

La aplicación se conecta a un backend API REST configurado en:
- **URL Base**: `http://localhost:3002/v1.0`
- **Autenticación**: JWT Token
- **Endpoints**: Documentados en `environment.ts`

### Módulos del Backend
- **Authentication** - Login/logout
- **Users** - Gestión de usuarios y empleados
- **Inventory** - Control de inventario
- **Orders** - Sistema de órdenes
- **Cash Register** - Gestión de caja
- **Audit** - Logs de auditoría

## 🎨 Personalización

### Temas y Colores
El sistema incluye un sistema de temas personalizable con:
- Colores primarios configurables
- Modo oscuro/claro
- Variables CSS personalizadas
- Componentes DaisyUI personalizados

### Configuración de Roles
```typescript
// Roles disponibles
- admin: Acceso completo al sistema
- cajero: Gestión de caja y órdenes
- inventory-manager: Gestión de inventario
```

## 📱 Características Responsive

- Diseño adaptable para desktop, tablet y móvil
- Navegación optimizada para diferentes tamaños de pantalla
- Componentes touch-friendly
- Layout flexible con Tailwind CSS

## 🔒 Seguridad

- Autenticación JWT
- Guards de ruta para protección
- Control de acceso basado en roles
- Validación de formularios
- Sanitización de datos

## 🧪 Testing

```bash
# Ejecutar tests unitarios
npm test

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar tests en modo watch
npm run test:watch
```

## 📦 Build y Despliegue

### Build de Producción
```bash
npm run build
```

### Configuración de Build
- Optimización automática
- Minificación de código
- Tree shaking
- Lazy loading de módulos

**Versión**: 0.0.0  
**Última actualización**: 2024  
**Framework**: Angular 20  
**Estado**: En desarrollo activo
