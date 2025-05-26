# Incidentes Mantenimiento

Este es un proyecto de Next.js para la gestión de incidentes de mantenimiento. La aplicacion es parte de un proyecto de universidad, del curso de Bases de datos III

## Tecnologías Principales

- [Next.js 14](https://nextjs.org/)
- [React 18](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [Radix UI](https://www.radix-ui.com/) para componentes de interfaz

## Requisitos Previos

Antes de comenzar, esto es lo que necesitas tener instalado:

- Node.js (versión 18 o superior)
- npm (viene incluido con Node.js)

## Instalación

1. Clona el repositorio:
```bash
git clone [URL-del-repositorio]
cd incidentes-mantenimiento
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
   - Crea un archivo `.env.local` en la raíz del proyecto
   - Añade las variables necesarias para Firebase:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id
```

## Uso

### Desarrollo

Para ejecutar el proyecto en modo desarrollo:

```bash
npm run dev
```

Esto iniciará el servidor de desarrollo en `http://localhost:3000`

### Construcción para Producción

Para construir el proyecto para producción:

```bash
npm run build
```

### Iniciar en Producción

Para iniciar la aplicación en modo producción:

```bash
npm run start
```

## Características Principales

- Gestión de incidentes y mantenimientos de equipos
- Interfaz de usuario moderna y responsiva
- Integración con Firebase para almacenamiento de datos
- Componentes UI interactivos con Radix UI
- Estilizado con Tailwind CSS

## Estructura del Proyecto

- `/src` - Código fuente principal
- `/public` - Archivos estáticos
- `/components` - Componentes React reutilizables
- `/pages` - Rutas y páginas de la aplicación
- `/styles` - Estilos globales y configuración de Tailwind
