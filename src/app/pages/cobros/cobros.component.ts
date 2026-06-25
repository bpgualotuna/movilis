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
  activeTab: 'historial' | 'registro' = 'historial';

  setActiveTab(tab: 'historial' | 'registro'): void {
    this.activeTab = tab;
  }

  // Upload y Abonos properties
  fileName = '';
  comprobanteFile: File | null = null;
  costoTotalConcepto = 0;
  sobranteDeuda = 0;

  conceptCosts: Record<string, number> = {
    'Matrícula de Desarrollo de Software': 150.00,
    'Matrícula de Estética': 120.00,
    'Matrícula de Transporte': 150.00,
    'Mensualidad Desarrollo de Software - Mayo': 120.00,
    'Mensualidad Estética - Mayo': 85.00,
    'Derechos de Examen': 45.00,
    'Derechos de Certificación': 30.00
  };

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
      tipoPago: ['TOTAL', Validators.required],
      monto: ['', [Validators.required, Validators.min(0.01)]],
      metodoPago: ['', Validators.required],
      comprobante: [null]
    });

    // Escuchar cambios en metodoPago para ajustar validación de comprobante
    this.pagoForm.get('metodoPago')?.valueChanges.subscribe(metodo => {
      const comprobanteControl = this.pagoForm.get('comprobante');
      if (metodo === 'Transferencia Bancaria') {
        comprobanteControl?.setValidators([Validators.required]);
      } else {
        comprobanteControl?.clearValidators();
        this.fileName = '';
        this.comprobanteFile = null;
      }
      comprobanteControl?.updateValueAndValidity();
    });

    // Escuchar cambios en concepto y tipoPago para manejar el monto y la deuda
    this.pagoForm.get('concepto')?.valueChanges.subscribe(() => this.actualizarMontoYDeuda());
    this.pagoForm.get('tipoPago')?.valueChanges.subscribe(() => this.actualizarMontoYDeuda());
    this.pagoForm.get('monto')?.valueChanges.subscribe(() => this.calcularSobranteDeuda());
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
    const formValue = this.pagoForm.getRawValue();
    
    const nuevoPago: Omit<Pago, 'id'> = {
      fecha: new Date().toISOString().split('T')[0],
      alumno: formValue.alumno,
      identificacion: formValue.identificacion,
      concepto: formValue.concepto,
      monto: Number(formValue.monto),
      metodoPago: formValue.metodoPago,
      estado: 'PAGADO', // Los pagos registrados manualmente se aprueban por defecto
      tipoPago: formValue.tipoPago,
      sobranteDeuda: formValue.tipoPago === 'ABONO' ? this.sobranteDeuda : 0,
      comprobanteNombre: formValue.metodoPago === 'Transferencia Bancaria' ? this.fileName : undefined
    };

    this.cobrosService.registrarPago(nuevoPago).subscribe({
      next: (pagoCreado) => {
        this.pagos.unshift(pagoCreado);
        this.applyFilters();
        this.isSubmitting = false;
        this.showSuccessModal = true;
        this.pagoForm.reset({ tipoPago: 'TOTAL' });
        this.fileName = '';
        this.comprobanteFile = null;
        this.activeTab = 'historial';
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

  exportarCSV(): void {
    if (this.pagosFiltrados.length === 0) {
      alert('No hay transacciones para exportar.');
      return;
    }

    const headers = ['Fecha', 'Estudiante', 'Identificación', 'Concepto', 'Monto', 'Método de Pago', 'Estado'];
    const rows = this.pagosFiltrados.map(pago => [
      pago.fecha,
      pago.alumno,
      `="${pago.identificacion}"`, // Prevenir notación científica en Excel
      pago.concepto,
      pago.monto.toFixed(2),
      pago.metodoPago,
      pago.estado
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_transacciones_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportarPDF(): void {
    if (this.pagosFiltrados.length === 0) {
      alert('No hay transacciones para exportar.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('No se pudo abrir la ventana de impresión. Por favor, permite las ventanas emergentes en tu navegador.');
      return;
    }

    const fechaExport = new Date().toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const rowsHtml = this.pagosFiltrados.map(pago => `
      <tr>
        <td>${pago.fecha}</td>
        <td><strong>${pago.alumno}</strong></td>
        <td>${pago.identificacion}</td>
        <td>${pago.concepto}</td>
        <td class="amount">$${pago.monto.toFixed(2)}</td>
        <td>${pago.metodoPago}</td>
        <td>
          <span class="badge ${pago.estado.toLowerCase()}">${pago.estado}</span>
        </td>
      </tr>
    `).join('');

    const totalMonto = this.pagosFiltrados.reduce((acc, pago) => acc + pago.monto, 0).toFixed(2);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Historial de Transacciones - Instituto Movilis</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
          body {
            font-family: 'Outfit', sans-serif;
            color: #333333;
            margin: 40px;
            background: #ffffff;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #881e80;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo-area h1 {
            color: #881e80;
            margin: 0;
            font-size: 24px;
            font-weight: 800;
          }
          .logo-area p {
            margin: 4px 0 0 0;
            font-size: 14px;
            color: #666;
          }
          .meta-info {
            text-align: right;
            font-size: 12px;
            color: #666;
          }
          h2 {
            color: #881e80;
            font-size: 18px;
            margin-top: 0;
            margin-bottom: 20px;
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-bottom: 30px;
          }
          th, td {
            padding: 12px 10px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          th {
            background-color: rgba(136, 30, 128, 0.05);
            color: #881e80;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
          }
          .amount {
            font-weight: 700;
            color: #881e80;
          }
          .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 99px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .badge.pagado {
            background-color: rgba(16, 185, 129, 0.1);
            color: #0d9488;
            border: 1px solid rgba(16, 185, 129, 0.2);
          }
          .badge.pendiente {
            background-color: rgba(217, 119, 6, 0.1);
            color: #b45309;
            border: 1px solid rgba(217, 119, 6, 0.2);
          }
          .summary-box {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
          }
          .summary-card {
            border: 1.5px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px 20px;
            background: #fafafa;
            min-width: 250px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 13px;
          }
          .summary-row:last-child {
            margin-bottom: 0;
            border-top: 1px solid #e5e7eb;
            padding-top: 8px;
            font-weight: 700;
            font-size: 15px;
            color: #881e80;
          }
          .footer {
            margin-top: 50px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #999;
          }
          @media print {
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-area">
            <h1>INSTITUTO SUPERIOR TECNOLÓGICO MOVILIS</h1>
            <p>Módulo de Cobros y Caja - Reporte de Transacciones</p>
          </div>
          <div class="meta-info">
            <p><strong>Fecha de Emisión:</strong><br>${fechaExport}</p>
            <p><strong>Registros:</strong> ${this.pagosFiltrados.length}</p>
          </div>
        </div>

        <h2>Reporte General de Transacciones</h2>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Estudiante</th>
              <th>Identificación</th>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="summary-box">
          <div class="summary-card">
            <div class="summary-row">
              <span>Total Transacciones:</span>
              <span>${this.pagosFiltrados.length}</span>
            </div>
            <div class="summary-row">
              <span>Total Recaudado:</span>
              <span>$${totalMonto}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Instituto Superior Tecnológico Movilis. Todos los derechos reservados.</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.fileName = file.name;
      this.comprobanteFile = file;
      this.pagoForm.patchValue({ comprobante: file });
      this.pagoForm.get('comprobante')?.updateValueAndValidity();
    }
  }

  actualizarMontoYDeuda(): void {
    const concepto = this.pagoForm.get('concepto')?.value;
    const tipoPago = this.pagoForm.get('tipoPago')?.value;
    const costoTotal = this.conceptCosts[concepto] || 0;

    if (tipoPago === 'TOTAL') {
      this.pagoForm.get('monto')?.setValue(costoTotal);
      this.pagoForm.get('monto')?.setValidators([Validators.required, Validators.min(0.01)]);
      this.pagoForm.get('monto')?.disable();
    } else {
      this.pagoForm.get('monto')?.enable();
      this.pagoForm.get('monto')?.setValidators([Validators.required, Validators.min(0.01), Validators.max(costoTotal)]);
    }
    this.pagoForm.get('monto')?.updateValueAndValidity();
    this.calcularSobranteDeuda();
  }

  calcularSobranteDeuda(): void {
    const concepto = this.pagoForm.get('concepto')?.value;
    const monto = Number(this.pagoForm.getRawValue().monto) || 0;
    this.costoTotalConcepto = this.conceptCosts[concepto] || 0;

    if (this.pagoForm.get('tipoPago')?.value === 'ABONO' && this.costoTotalConcepto > 0) {
      this.sobranteDeuda = Math.max(0, this.costoTotalConcepto - monto);
    } else {
      this.sobranteDeuda = 0;
    }
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
