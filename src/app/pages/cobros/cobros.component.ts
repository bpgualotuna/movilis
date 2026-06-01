import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CobrosService, Pago } from '../../services/cobros.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-cobros',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cobros.component.html',
  styleUrl: './cobros.component.scss'
})
export class CobrosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cobrosService = inject(CobrosService);

  pagos: Pago[] = [];
  pagosFiltrados: Pago[] = [];
  alumnosSugeridos: string[] = [];
  
  isLoading = true;
  isSubmitting = false;
  showSuccessModal = false;
  showAutocomplete = false;

  // Filtros de búsqueda
  searchQuery = '';
  statusFilter = '';

  // Formulario reactivo
  pagoForm!: FormGroup;
  
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.initForm();
    this.loadPagos();
    this.setupAutocompleteSearch();
  }

  initForm(): void {
    this.pagoForm = this.fb.group({
      alumno: ['', [Validators.required, Validators.maxLength(100)]],
      identificacion: ['', [Validators.required, Validators.pattern('^[0-9]{10}$|^[0-9]{13}$')]],
      concepto: ['', Validators.required],
      monto: ['', [Validators.required, Validators.min(0.01)]],
      metodoPago: ['', Validators.required]
    });
  }

  loadPagos(): void {
    this.isLoading = true;
    this.cobrosService.getPagos().subscribe({
      next: (pagos) => {
        this.pagos = pagos;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar pagos:', err);
        this.isLoading = false;
      }
    });
  }

  setupAutocompleteSearch(): void {
    this.searchSubject.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          this.showAutocomplete = false;
          return of([]);
        }
        return this.cobrosService.buscarAlumnos(query);
      })
    ).subscribe(sugerencias => {
      this.alumnosSugeridos = sugerencias;
      this.showAutocomplete = sugerencias.length > 0;
    });
  }

  onAlumnoInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  seleccionarAlumno(nombre: string): void {
    this.pagoForm.patchValue({ alumno: nombre });
    this.showAutocomplete = false;
    this.alumnosSugeridos = [];
    
    // Generar un número de identificación aleatorio ficticio basado en el nombre para comodidad del usuario
    const mockCedulas: Record<string, string> = {
      'Brayan Gualotuña': '1723456789',
      'María José Espinosa': '1754896231',
      'Carlos Luis Andrade': '0928374615',
      'Ana Lucía Torres': '1712984536',
      'Juan Fernando Castro': '1847569231'
    };
    
    if (mockCedulas[nombre]) {
      this.pagoForm.patchValue({ identificacion: mockCedulas[nombre] });
    }
  }

  onSearchChange(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onStatusFilterChange(event: Event): void {
    this.statusFilter = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  applyFilters(): void {
    const query = this.searchQuery.toLowerCase().trim();
    
    this.pagosFiltrados = this.pagos.filter(pago => {
      const matchQuery = !query || 
                         pago.alumno.toLowerCase().includes(query) || 
                         pago.identificacion.includes(query) ||
                         pago.concepto.toLowerCase().includes(query);
      
      const matchStatus = !this.statusFilter || pago.estado === this.statusFilter;
      
      return matchQuery && matchStatus;
    });
  }

  onSubmit(): void {
    if (this.pagoForm.invalid) {
      this.markFormGroupTouched(this.pagoForm);
      return;
    }

    this.isSubmitting = true;
    const formValue = this.pagoForm.value;
    
    const nuevoPago: Omit<Pago, 'id'> = {
      fecha: new Date().toISOString().split('T')[0],
      alumno: formValue.alumno,
      identificacion: formValue.identificacion,
      concepto: formValue.concepto,
      monto: Number(formValue.monto),
      metodoPago: formValue.metodoPago,
      estado: 'PAGADO' // Los pagos registrados manualmente se aprueban por defecto
    };

    this.cobrosService.registrarPago(nuevoPago).subscribe({
      next: (pagoCreado) => {
        this.pagos.unshift(pagoCreado);
        this.applyFilters();
        this.isSubmitting = false;
        this.showSuccessModal = true;
        this.pagoForm.reset();
      },
      error: (err) => {
        console.error('Error al registrar pago:', err);
        this.isSubmitting = false;
      }
    });
  }

  cerrarSuccessModal(): void {
    this.showSuccessModal = false;
  }

  // Helpers de validación
  hasError(controlName: string, errorName: string): boolean {
    const control = this.pagoForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
