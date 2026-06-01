# Capa 2: ENTITIES (Dominio y Entidades de Negocio)

La capa `entities/` es el corazón de la lógica de negocio de la aplicación. Representa los conceptos clave del negocio y del dominio (por ejemplo: "Estudiante", "Catálogo/Enum", "Dirección/Ubicación"). Aquí se define la estructura de los datos, las validaciones de negocio independientes del framework y las interfaces para la obtención de datos.

---

## 🏛️ Rol en la Arquitectura

*   **Feature-Sliced Design (FSD):** Es la capa intermedia de nivel inferior. Aísla los datos del negocio y los servicios que los gestionan, haciéndolos disponibles para que las features y widgets los utilicen de forma unificada.
*   **Arquitectura Hexagonal (Núcleo y Adaptadores):** Aquí es donde la arquitectura hexagonal brilla:
    *   **Núcleo/Dominio (`model/`):** Contiene los modelos del dominio, objetos de valor y las definiciones de interfaces de servicios (**Puertos de Salida - Output Ports**). Está totalmente aislado de detalles técnicos.
    *   **Adaptadores (`api/`):** Contiene las implementaciones técnicas de los puertos (**Adaptadores de Salida - Output Adapters**), como llamadas HTTP (`HttpClient`) o persistencia local.
*   **Atomic Design:** No contiene componentes visuales complejos. En raras ocasiones puede albergar representaciones visuales muy básicas y específicas del dominio (por ejemplo, una tarjeta de información del estudiante - `StudentCard`), las cuales actúan de forma pasiva.

---

## 🚫 Reglas de Dependencia e Importaciones

*   **Importaciones Permitidas:** Puede importar elementos de:
    *   `shared/` (para utilizar clientes HTTP comunes, utilidades globales, tipados de soporte e interfaces generales de infraestructura).
*   **Importaciones Prohibidas:** No puede importar absolutamente nada de las capas superiores: `features/`, `widgets/`, `pages/` o `app/`. Asimismo, una entidad no debe importar directamente código de otra entidad a menos que sea una relación directa del dominio (por ejemplo, un Estudiante contiene una lista de Catalogos).

---

## 📁 Estructura Interna Sugerida

Cada entidad de negocio debe modularizarse en su propio directorio:

```
entities/
├── README.md
├── estudiante/                          # Entidad Estudiante
│   ├── model/                           # Dominio (Puertos e Interfaces)
│   │   ├── student.interface.ts         # Modelo de datos de negocio
│   │   └── student-repository.port.ts   # Definición del puerto de datos (Interface)
│   └── api/                             # Infraestructura (Adaptadores)
│       └── student.service.ts           # Servicio Angular que implementa el puerto y llama a la API REST
└── catalogo/                            # Entidad Catálogo
    ├── model/
    └── api/
```

---

## 📝 Ejemplo de Puerto y Adaptador de Entidad

### 1. El Puerto (`estudiante/model/student-repository.port.ts` - Dominio puro)
```typescript
import { Observable } from 'rxjs';
import { Student } from './student.interface';

export interface StudentRepositoryPort {
  getEstudianteByCedula(tipo: string, cedula: string): Observable<Student>;
  saveStudent(student: Student): Observable<boolean>;
}
```

### 2. El Adaptador (`estudiante/api/student.service.ts` - Infraestructura)
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentRepositoryPort } from '../model/student-repository.port';
import { Student } from '../model/student.interface';

@Injectable({
  providedIn: 'root'
})
export class StudentService implements StudentRepositoryPort {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/estudiantes';

  getEstudianteByCedula(tipo: string, cedula: string): Observable<Student> {
    return this.http.get<Student>(`${this.API_URL}/buscar?tipo=${tipo}&cedula=${cedula}`);
  }

  saveStudent(student: Student): Observable<boolean> {
    return this.http.post<boolean>(this.API_URL, student);
  }

  // Persistencia local (Adaptador local storage)
  saveLocalData(data: any): void {
    localStorage.setItem('student_form_data', JSON.stringify(data));
  }
}
```
