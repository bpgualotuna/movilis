import { Routes } from '@angular/router';
import { StudentForm } from './features/estudiantes/components/student-form/student-form';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DashboardHomeComponent } from './pages/dashboard/home/dashboard-home.component';
import { CobrosComponent } from './pages/cobros/cobros.component';
import { ReportesComponent } from './pages/reportes/reportes.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', component: DashboardHomeComponent },
      { path: 'registro', component: StudentForm, data: { fase: 1 } },
      { path: 'ficha-socioeconomica', component: StudentForm, data: { fase: 2 } },
      { path: 'cobros', component: CobrosComponent },
      { path: 'reportes', component: ReportesComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
