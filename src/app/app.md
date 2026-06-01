# Capa 6: APP (Configuración y Configuración Global)

La capa `app/` es el punto de entrada y la base del Feature-Sliced Design (FSD). Contiene la configuración global de la aplicación, los estilos compartidos por todo el proyecto, los proveedores globales de dependencias y el enrutamiento principal.

---

## 🏛️ Rol en la Arquitectura

*   **Feature-Sliced Design (FSD):** Es la capa superior. Aquí se inicializan y conectan todos los módulos y capas inferiores. Define cómo arranca la aplicación.
*   **Arquitectura Hexagonal:** Actúa como el **Composition Root** (Raíz de Composición). Aquí se instancian los adaptadores de infraestructura globales, se inyectan las configuraciones del entorno y se configuran las dependencias del sistema.
*   **Atomic Design:** No contiene componentes visuales atómicos. Sirve de contenedor general que renderiza el layout principal de la aplicación.

---

## 📁 Archivos Clave en esta Capa

En este proyecto de Angular, la capa `app` está compuesta por los archivos situados en la raíz de `src/app/`:

*   `app.ts`: El componente contenedor principal (`<app-root>`), que típicamente aloja el `<router-outlet>` y layouts de páginas de alto nivel.
*   `app.config.ts`: Configura los proveedores de Angular como el enrutador (`provideRouter`), la detección de cambios, el cliente HTTP, etc.
*   `app.routes.ts`: Define las rutas de navegación de primer nivel (mapeadas a los componentes de la capa `pages/`).
*   `app.scss`: Contiene los estilos SCSS de la aplicación global, incluyendo variables CSS, reset de estilos y la base temática visual.

---

## 🚫 Reglas de Dependencia e Importaciones

*   **Importaciones Permitidas:** Puede importar elementos de **todas** las capas inferiores:
    *   `pages/` (por ejemplo, para configurar las rutas).
    *   `widgets/` (para layouts globales como el Navbar o Footer si se inyectan directamente en el shell).
    *   `features/`, `entities/`, `shared/` (para configuraciones, proveedores y constantes globales).
*   **Importaciones Prohibidas:** Ninguna otra capa de la aplicación (como `pages`, `features`, `entities`, etc.) puede importar nada desde la capa `app/`. Esto evita dependencias circulares y garantiza que la configuración sea unidireccional de arriba hacia abajo.

---

## 📝 Ejemplo de Configuración (`app.config.ts`)

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient() // Proveedor HTTP para los adaptadores de salida
  ]
};
```
