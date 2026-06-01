# Capa 4: WIDGETS (Bloques de Interfaz Autónomos)

La capa `widgets/` contiene componentes visuales complejos y autónomos. Son bloques de interfaz de usuario de nivel medio-alto que se integran en las páginas. Su objetivo es agrupar lógica de negocio, entidades y features en una unidad funcional reutilizable y autocontenida (por ejemplo, una barra de navegación completa, un panel de control, o el formulario paso a paso de registro).

---

## 🏛️ Rol en la Arquitectura

*   **Feature-Sliced Design (FSD):** Es la capa intermedia que combina múltiples `features` y `entities` para crear componentes visuales de gran escala. Un widget puede funcionar de manera independiente si se coloca en cualquier página.
*   **Arquitectura Hexagonal:** Actúa como un **Coordinador o Adaptador de Entrada Compuesto**. Los widgets inyectan servicios y gestionan el flujo de datos global de su sección, llamando a casos de uso expuestos por los servicios de negocio.
*   **Atomic Design:** Se asocia directamente con los **Organismos (Organisms)** complejos. Son estructuras que combinan múltiples moléculas y átomos junto con lógica de estado específica para crear una funcionalidad robusta.

---

## 🚫 Reglas de Dependencia e Importaciones

*   **Importaciones Permitidas:** Puede importar elementos de:
    *   `features/` (para incluir acciones interactivas de negocio dentro del widget).
    *   `entities/` (para representar y tipar los datos de negocio utilizados).
    *   `shared/` (para componentes visuales reutilizables, utilidades y librerías).
*   **Importaciones Prohibidas:** No puede importar nada de la capa `pages/` ni de la capa `app/`. Asimismo, un widget no debe importar código de otro widget para mantener la independencia.

---

## 📁 Estructura Interna Sugerida

Cada widget tiene su propio subdirectorio e interactúa mediante un API público limpio:

```
widgets/
├── README.md
└── registration-wizard/                 # Coordinador del formulario paso a paso
    ├── index.ts                         # Punto de entrada expuesto
    ├── registration-wizard.ts           # Componente principal (Orquestador)
    ├── registration-wizard.html
    └── registration-wizard.scss
```

---

## 📝 Ejemplo de Widget (`registration-wizard.ts`)

Este widget coordinaría el flujo de los pasos de registro del estudiante (actualmente distribuidos en el archivo monolítico `student-form.ts`):

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { StudentService } from '../../entities/estudiante/api/student.service';
import { SaveStudentProgressFeature } from '../../features/save-student-progress/ui/save-button';

@Component({
  selector: 'app-registration-wizard',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    SaveStudentProgressFeature // Importa una funcionalidad concreta
  ],
  template: `
    <div class="wizard-container">
      <h2>Ficha Estudiantil</h2>
      <!-- Componentes y lógica del wizard de formulario aquí -->
      <app-save-student-progress [form]="form"></app-save-student-progress>
    </div>
  `
})
export class RegistrationWizardWidget {
  private studentService = inject(StudentService);
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      // Definición simplificada del formulario
    });
  }
}
```
