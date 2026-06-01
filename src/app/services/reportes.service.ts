import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface KpiCard {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
}

export interface IngresoPorCarrera {
  carrera: string;
  monto: number;
  porcentaje: number;
  color: string;
}

export interface CrecimientoMensual {
  mes: string;
  alumnos: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  getKpis(): Observable<KpiCard[]> {
    const kpis: KpiCard[] = [
      {
        title: 'Cobros Totales Mensuales',
        value: '$12,450.00',
        change: '+12.4% vs mes anterior',
        isPositive: true,
        icon: 'dollar'
      },
      {
        title: 'Alumnos Registrados Hoy',
        value: '18 alumnos',
        change: '+3 alumnos vs ayer',
        isPositive: true,
        icon: 'users'
      },
      {
        title: 'Tasa de Cumplimiento de Pago',
        value: '94.2%',
        change: '+1.5% vs mes anterior',
        isPositive: true,
        icon: 'percent'
      },
      {
        title: 'Morosidad Actual',
        value: '5.8%',
        change: '-1.2% vs mes anterior',
        isPositive: true, // It's positive since morosity is decreasing
        icon: 'alert-triangle'
      }
    ];
    return of(kpis);
  }

  getIngresosPorCarrera(): Observable<IngresoPorCarrera[]> {
    const datos: IngresoPorCarrera[] = [
      { carrera: 'Desarrollo de Software', monto: 6800.00, porcentaje: 54.6, color: '#f9eb1d' },
      { carrera: 'Estética', monto: 3250.00, porcentaje: 26.1, color: '#a855f7' },
      { carrera: 'Transporte', monto: 2400.00, porcentaje: 19.3, color: '#06b6d4' }
    ];
    return of(datos);
  }

  getCrecimientoMensual(): Observable<CrecimientoMensual[]> {
    const datos: CrecimientoMensual[] = [
      { mes: 'Enero', alumnos: 45 },
      { mes: 'Febrero', alumnos: 62 },
      { mes: 'Marzo', alumnos: 81 },
      { mes: 'Abril', alumnos: 98 },
      { mes: 'Mayo', alumnos: 110 }
    ];
    return of(datos);
  }
}
