import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReportesService, KpiCard } from '../../../services/reportes.service';

interface ActividadReciente {
  tipo: 'registro' | 'pago' | 'ficha';
  titulo: string;
  descripcion: string;
  tiempo: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss'
})
export class DashboardHomeComponent implements OnInit {
  private reportesService = inject(ReportesService);
  kpis: KpiCard[] = [];
  isLoading = true;

  actividades: ActividadReciente[] = [
    {
      tipo: 'registro',
      titulo: 'Nuevo estudiante registrado',
      descripcion: 'Brayan Gualotuña se ha preinscrito en Desarrollo de Software.',
      tiempo: 'Hace 2 horas'
    },
    {
      tipo: 'pago',
      titulo: 'Cobro registrado exitosamente',
      descripcion: 'Cobro de matrícula de $150.00 aprobado para Brayan Gualotuña.',
      tiempo: 'Hace 3 horas'
    },
    {
      tipo: 'ficha',
      titulo: 'Ficha Socioeconómica Completada',
      descripcion: 'María José Espinosa completó los pasos socioeconómicos con éxito.',
      tiempo: 'Hace 5 horas'
    },
    {
      tipo: 'registro',
      titulo: 'Nueva postulación recibida',
      descripcion: 'Carlos Luis Andrade se ha registrado para la carrera de Transporte.',
      tiempo: 'Ayer'
    }
  ];

  ngOnInit(): void {
    this.reportesService.getKpis().subscribe({
      next: (kpis: KpiCard[]) => {
        this.kpis = kpis;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar KPIs del dashboard:', err);
        this.isLoading = false;
      }
    });
  }
}
