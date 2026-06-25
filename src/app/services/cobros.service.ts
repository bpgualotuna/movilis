import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface Pago {
  id: number;
  fecha: string;
  alumno: string;
  identificacion: string;
  concepto: string;
  monto: number;
  metodoPago: string;
  estado: 'PAGADO' | 'PENDIENTE';
  tipoPago?: 'TOTAL' | 'ABONO';
  sobranteDeuda?: number;
  comprobanteNombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CobrosService {
  // Lista inicial de pagos simulados
  private pagos: Pago[] = [
    {
      id: 1,
      fecha: '2026-05-28',
      alumno: 'Brayan Gualotuña',
      identificacion: '1723456789',
      concepto: 'Matrícula de Desarrollo de Software',
      monto: 150.00,
      metodoPago: 'Transferencia Bancaria',
      estado: 'PAGADO',
      tipoPago: 'TOTAL',
      sobranteDeuda: 0,
      comprobanteNombre: 'transfer_brayan.pdf'
    },
    {
      id: 2,
      fecha: '2026-05-27',
      alumno: 'María José Espinosa',
      identificacion: '1754896231',
      concepto: 'Mensualidad Estética - Mayo',
      monto: 50.00,
      metodoPago: 'Transferencia Bancaria',
      estado: 'PAGADO',
      tipoPago: 'ABONO',
      sobranteDeuda: 35.00,
      comprobanteNombre: 'comprobante_estetica_mje.png'
    },
    {
      id: 3,
      fecha: '2026-05-26',
      alumno: 'Carlos Luis Andrade',
      identificacion: '0928374615',
      concepto: 'Matrícula de Transporte',
      monto: 150.00,
      metodoPago: 'Tarjeta de Crédito',
      estado: 'PENDIENTE',
      tipoPago: 'TOTAL',
      sobranteDeuda: 0
    },
    {
      id: 4,
      fecha: '2026-05-25',
      alumno: 'Ana Lucía Torres',
      identificacion: '1712984536',
      concepto: 'Derechos de Examen',
      monto: 45.00,
      metodoPago: 'Transferencia Bancaria',
      estado: 'PAGADO',
      tipoPago: 'TOTAL',
      sobranteDeuda: 0,
      comprobanteNombre: 'ref_bco_ana_10928.png'
    },
    {
      id: 5,
      fecha: '2026-05-24',
      alumno: 'Juan Fernando Castro',
      identificacion: '1847569231',
      concepto: 'Mensualidad Desarrollo de Software - Mayo',
      monto: 80.00,
      metodoPago: 'Tarjeta de Crédito',
      estado: 'PENDIENTE',
      tipoPago: 'ABONO',
      sobranteDeuda: 40.00
    }
  ];

  // Alumnos para autocompletado
  private alumnosSimulados: string[] = [
    'Brayan Gualotuña',
    'María José Espinosa',
    'Carlos Luis Andrade',
    'Ana Lucía Torres',
    'Juan Fernando Castro',
    'David Alejandro Pérez',
    'Gabriela Sofía Salazar',
    'Ricardo Andrés Mendoza',
    'Sofía Victoria Ortega'
  ];

  getPagos(): Observable<Pago[]> {
    return of([...this.pagos]);
  }

  registrarPago(nuevoPago: Omit<Pago, 'id'>): Observable<Pago> {
    const pago: Pago = {
      ...nuevoPago,
      id: this.pagos.length + 1
    };
    this.pagos.unshift(pago); // Agregar al inicio
    return of(pago);
  }

  buscarAlumnos(query: string): Observable<string[]> {
    if (!query || query.trim() === '') {
      return of([]);
    }
    const cleanQuery = query.toLowerCase().trim();
    const filtrados = this.alumnosSimulados.filter(alumno => 
      alumno.toLowerCase().includes(cleanQuery)
    );
    return of(filtrados);
  }
}
