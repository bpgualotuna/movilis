import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesService, KpiCard, IngresoPorCarrera, CrecimientoMensual } from '../../services/reportes.service';
import { forkJoin } from 'rxjs';

interface MorosidadPorCarrera {
  carrera: string;
  morosidad: number;
  color: string;
  montoPendiente: number;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent implements OnInit {
  private reportesService = inject(ReportesService);

  kpis: KpiCard[] = [];
  ingresosCarrera: IngresoPorCarrera[] = [];
  crecimiento: CrecimientoMensual[] = [];
  
  morosidadCarrera: MorosidadPorCarrera[] = [
    { carrera: 'Desarrollo de Software', morosidad: 4.8, color: '#f9eb1d', montoPendiente: 340.00 },
    { carrera: 'Estética', morosidad: 8.5, color: '#a855f7', montoPendiente: 300.00 },
    { carrera: 'Transporte', morosidad: 3.2, color: '#06b6d4', montoPendiente: 80.00 }
  ];

  isLoading = true;
  totalIngresos = 0;
  maxAlumnos = 0;

  ngOnInit(): void {
    forkJoin({
      kpis: this.reportesService.getKpis(),
      ingresos: this.reportesService.getIngresosPorCarrera(),
      crecimiento: this.reportesService.getCrecimientoMensual()
    }).subscribe({
      next: (res) => {
        this.kpis = res.kpis;
        this.ingresosCarrera = res.ingresos;
        this.crecimiento = res.crecimiento;
        
        // Calcular total e ingresos max
        this.totalIngresos = this.ingresosCarrera.reduce((sum, item) => sum + item.monto, 0);
        this.maxAlumnos = Math.max(...this.crecimiento.map(item => item.alumnos));
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos de reportes:', err);
        this.isLoading = false;
      }
    });
  }

  // Helper para generar las coordenadas del gráfico SVG de barras
  getBarHeightPercentage(alumnos: number): number {
    return (alumnos / this.maxAlumnos) * 100;
  }
}
