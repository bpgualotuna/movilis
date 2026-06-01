# Capa 1: SHARED (Infraestructura y UI Común)

La capa `shared/` es el cimiento de la aplicación. Contiene el código completamente genérico e independiente del negocio que puede ser reutilizado libremente en cualquier parte del proyecto. Es el nivel de abstracción más bajo.

---

## 🏛️ Rol en la Arquitectura

*   **Feature-Sliced Design (FSD):** Es la capa base. No contiene conocimiento del dominio de negocio específico de la aplicación. Solo ofrece bloques genéricos de construcción: utilidades de fecha, clientes HTTP base, enums generales y componentes de UI puros.
*   **Arquitectura Hexagonal:** Aloja los **Adaptadores e Interfaces de Infraestructura Comunes**. Por ejemplo, el cliente base HTTP, interceptores globales de seguridad o errores, y configuraciones generales del entorno de ejecución.
*   **Atomic Design:** Es la cuna de los componentes reutilizables:
    *   **Átomos (Atoms):** Elementos HTML básicos e indivisibles estilizados (botones, entradas de texto simples, iconos, etiquetas).
    *   **Moléculas (Molecules):** Combinaciones genéricas (un label + un input de texto + un mensaje de error).
    *   **Plantillas (Templates):** Layouts estructurales vacíos (grillas de visualización, contenedores responsivos).

---

## 🚫 Reglas de Dependencia e Importaciones

*   **Importaciones Permitidas:** Solo puede importar elementos de su propia capa (es decir, subcarpetas dentro de `shared/`). No tiene permitido importar nada de ninguna capa superior.
*   **Importaciones Prohibidas:** Prohibido importar de `entities/`, `features/`, `widgets/`, `pages/` o `app/`. Esto asegura que el código sea verdaderamente genérico y portable a otros proyectos.

---

## 📁 Estructura Interna Sugerida

Se organiza por la naturaleza técnica de su contenido:

```
shared/
├── README.md
├── ui/                                  # Componentes visuales genéricos (Atomic Design)
│   ├── atoms/                           # Átomos: botón, input, select, label
│   │   ├── button/
│   │   └── input/
│   ├── molecules/                       # Moléculas: form-field, search-bar
│   │   └── form-field/
│   ├── organisms/                       # Organismos genéricos (sin lógica de negocio)
│   │   └── modal/
│   └── templates/                       # Plantillas estructurales (ej: layouts de grilla)
├── api/                                 # Clientes HTTP base y configuraciones de red
└── lib/                                 # Librerías auxiliares (validadores personalizados, helpers de fecha)
```

---

## 📝 Ejemplo de Átomo y Molécula de UI

### 1. Átomo: Botón Genérico (`ui/atoms/button/button.ts`)
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'shared-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button [type]="type" class="btn" [ngClass]="variant" (click)="onClick.emit($event)">
      <slot><ng-content></ng-content></slot>
    </button>
  `,
  styles: [`
    .btn { padding: 0.5rem 1rem; border-radius: 4px; border: none; cursor: pointer; font-weight: 500; }
    .primary { background-color: #0056b3; color: white; }
    .secondary { background-color: #6c757d; color: white; }
  `]
})
export class SharedButton {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Output() onClick = new EventEmitter<MouseEvent>();
}
```

### 2. Molécula: Campo de Formulario (`ui/molecules/form-field/form-field.ts`)
```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'shared-form-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="field-container">
      <label [for]="id" class="label">{{ label }}</label>
      <input [id]="id" [type]="type" [formControl]="control" class="input" />
      <span *ngIf="control.touched && control.invalid" class="error-msg">
        Campo requerido o inválido
      </span>
    </div>
  `,
  styles: [`
    .field-container { display: flex; flex-direction: column; margin-bottom: 1rem; }
    .label { font-size: 0.9rem; font-weight: bold; margin-bottom: 0.25rem; }
    .input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
    .error-msg { color: #dc3545; font-size: 0.8rem; margin-top: 0.25rem; }
  `]
})
export class SharedFormField {
  @Input() id!: string;
  @Input() label!: string;
  @Input() type: string = 'text';
  @Input() control!: FormControl;
}
```
