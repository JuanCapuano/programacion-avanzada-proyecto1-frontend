# Distribuidora BV - Frontend (Gestión de Productos e Inventario)

Interfaz web para el sistema de gestión integral de una distribuidora. Construido con React, TypeScript y Vite, siguiendo una arquitectura modular con componentes reutilizables y comunicación con la API Backend.

---

## Stack tecnológico

* **Framework/Biblioteca:** React 19.0
* **Lenguaje:** TypeScript 5.7
* **Herramienta de Build:** Vite 6.1
* **Ruteo:** React Router DOM 7.2
* **Estilos:** Tailwind CSS 3.4
* **Componentes UI:** Shadcn UI + Radix UI
* **Tablas y Gráficos:** AG Grid 33.3 + Recharts 2.15
* **Gestión de Estado:** Jotai 2.15
* **Formularios & Validación:** React Hook Form 7.54 + Yup 1.6
* **Peticiones HTTP:** Axios 1.8
* **Autenticación Social:** Google OAuth + Facebook Login
* **Linting/Formato:** ESLint 9.19
* **Infraestructura:** Docker + Vercel

---

## Estructura del proyecto

```text
distribuidora-bv-frontend/
├── public/                    # Recursos estáticos públicos
├── src/
│   ├── main.tsx               # Punto de entrada de la aplicación
│   ├── App.tsx                # Componente raíz y ruteo
│   ├── assets/                # Recursos estáticos e imágenes
│   ├── componentes/           # Componentes UI reutilizables
│   │   ├── gestion-producto/  # Módulo de catálogo, stock y precios
│   │   ├── gestion-usuario/   # Módulo de usuarios y autenticación
│   │   ├── gestion-organizacion/ # Módulo de clientes y proveedores
│   │   ├── sistema/           # Notificaciones y modales
│   │   └── ui/                # Componentes genéricos de interfaz
│   ├── config/                # Configuración de clientes API
│   ├── context/               # Proveedores de estado global
│   ├── hooks/                 # Custom hooks reutilizables
│   ├── interfaces/            # Tipado TypeScript
│   ├── pages/                 # Páginas y vistas principales
│   └── utils/                 # Utilidades y formateadores
├── Dockerfile                 # Configuración de imagen Docker
├── tailwind.config.js         # Configuración de Tailwind CSS
├── vercel.json                # Configuración para Vercel
├── vite.config.ts             # Configuración de Vite
└── package.json               # Dependencias del proyecto

```

### Local
```bash
# Instalar dependencias
npm install

# Desarrollo con hot-reload
npm run dev

# Producción
npm run build

```
