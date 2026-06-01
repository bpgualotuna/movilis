# Capa 3: FEATURES (Funcionalidades y Acciones de Usuario)

La capa `features/` contiene las funcionalidades que aportan valor directo al negocio y representan acciones concretas que un usuario puede realizar en la aplicación (por ejemplo: "Autoguardado de progreso", "Subida de archivos adjuntos", "Búsqueda y validación de estudiante").

---

## 🏛️ Rol en la Arquitectura

*   **Feature-Sliced Design (FSD):** Es la capa donde residen los casos de uso interactivos. A diferencia de las entidades (que solo definen la estructura de datos y métodos puros), las `features` implementan la interacción del usuario con esos datos (por ejemplo, el botón de "Guardar borrador" que interactúa con el servicio de persistencia).
*   **Arquitectura Hexagonal:** Representa los **Casos de Uso (Use Cases)** o **Adaptadores de Entrada (Input Adapters)** a nivel de interacción de UI. Una feature expone interfaces para que los componentes reaccionen a eventos del usuario y llamen a los puertos de salida (servicios, APIs).
*   **Atomic Design:** Se asocia a **Moléculas (Molecules)** funcionales o pequeños **Organismos (Organisms)**. Contienen inputs, botones o selectores agrupados que realizan una acción específica con estado interno de UI.

---

## 🚫 Reglas de Dependencia e Importaciones

*   **Importaciones Permitidas:** Puede importar elementos de:
    *   `entities/` (para interactuar con las entidades y llamar a sus servicios y modelos).
    *   `shared/` (para componentes visuales reutilizables, utilidades y librerías).
*   **Importaciones Prohibidas:** No puede importar nada de la capa `widgets/`, `pages/` o `app/`. Asimismo, una feature no debe importar directamente código de otra feature para garantizar un acoplamiento cero.

---

## 📁 Estructura Interna Sugerida

Cada funcionalidad de usuario debe tener su propia carpeta estructurada internamente:

```
features/
├── README.md
└── save-student-progress/               # Acción de autoguardado del formulario
    ├── ui/                              # Elementos visuales de la feature (botones, badges de estado)
    │   ├── save-button.ts
    │   └── save-button.html
    ├── model/                           # Estado o lógica interna temporal de la feature
    └── api/                             # Servicios necesarios exclusivos de esta feature
```

---

## 📝 Ejemplo de Feature (`save-button.ts`)

```typescript
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { StudentService } from '../../entities/estudiante/api/student.service';

@Component({
  selector: 'app-save-student-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="saveProgress()" class="btn-save" [disabled]="isSaving">
      {{ isSaving ? 'Guardando...' : 'Guardar Progreso' }}
    </button>
  `,
  styles: [`
    .btn-save { background-color: var(--color-primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
  `]
})
export class SaveStudentProgressFeature {
  @Input() form!: FormGroup;
  private studentService = inject(StudentService);
  isSaving = false;

  saveProgress() {
    this.isSaving = true;
    const data = this.form.getRawValue();
    this.studentService.saveLocalData(data);
    setTimeout(() => this.isSaving = false, 500);
  }
}
```
