# Capa 5: PAGES (Páginas de la Aplicación)

La capa `pages/` contiene los componentes que representan las vistas o pantallas completas de la aplicación. Estos componentes están directamente mapeados a las rutas de navegación de la aplicación y coordinan la composición visual y el flujo de datos principal de cada vista.

---

## 🏛️ Rol en la Arquitectura

*   **Feature-Sliced Design (FSD):** Es la segunda capa más alta. Su única responsabilidad es componer widgets, features y entities para armar una pantalla. No debe contener lógica de negocio compleja ni estilos detallados de componentes individuales.
*   **Arquitectura Hexagonal:** Actúa como un **Adaptador de Entrada (Input Adapter)** del enrutador de Angular. Se encarga de capturar parámetros de la URL, query params o el estado de la navegación, y delegar el comportamiento a los servicios o casos de uso.
*   **Atomic Design:** Representa los niveles **5 (Páginas)** y **4 (Plantillas)**. 
    *   *Plantilla (Template):* Define la estructura espacial (dónde va la barra lateral, dónde el contenido principal) sin conocer los datos reales.
    *   *Página (Page):* Inyecta los datos reales de negocio sobre la plantilla y monta los componentes funcionales (`widgets`).

---

## 🚫 Reglas de Dependencia e Importaciones

*   **Importaciones Permitidas:** Puede importar elementos de:
    *   `widgets/` (composición principal de bloques visuales).
    *   `features/` (para disparar acciones concretas del usuario).
    *   `entities/` (para tipados y lógica de negocio).
    *   `shared/` (para layouts genéricos, componentes comunes y utilidades).
*   **Importaciones Prohibidas:** No puede importar nada desde la capa `app/`. Asimismo, otras páginas no deben importarse entre sí.

---

## 📁 Estructura Interna Sugerida

Cada página se almacena en su propio directorio con un punto de entrada público (`index.ts` o exportado directamente desde el archivo del componente):

```
pages/
├── README.md
└── student-registration/
    ├── student-registration-page.ts     # Componente controlador de la página
    ├── student-registration-page.html   # Estructura/Template de la página
    └── student-registration-page.scss   # Estilos exclusivos de estructura (ej: padding, grid de la página)
```

---

## 📝 Ejemplo de Página (`student-registration-page.ts`)

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationWizardWidget } from '../../widgets/registration-wizard/registration-wizard-widget';

@Component({
  selector: 'app-student-registration-page',
  standalone: true,
  imports: [CommonModule, RegistrationWizardWidget],
  template: `
    <main class="page-layout">
      <!-- Un widget complejo que orquesta el formulario por pasos -->
      <app-registration-wizard-widget></app-registration-wizard-widget>
    </main>
  `,
  styles: [`
    .page-layout {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
  `]
})
export class StudentRegistrationPage implements OnInit {
  ngOnInit() {
    console.log('Página de registro de estudiante cargada.');
  }
}
```
