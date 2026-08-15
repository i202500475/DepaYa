import { Routes } from '@angular/router';

import { InicioComponent } from './components/inicio/inicio.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';

import { AdminComponent } from './components/admin/admin.component';

import { ExplorarComponent } from './components/explorar/explorar.component';

import { DepartamentoFormularioComponent } from './components/departamento-formulario/departamento-formulario.component';

import { MisDepartamentosComponent } from './components/mis-departamentos/mis-departamentos.component';
import { MisAlquileresComponent } from './components/mis-alquileres/mis-alquileres.component';
import { MisPagosComponent } from './components/mis-pagos/mis-pagos.component';

import { MisReservasComponent } from './components/mis-reservas/mis-reservas.component';
import { ReservaFormularioComponent } from './components/reserva-formulario/reserva-formulario.component';

import { authGuard, adminGuard, propietarioGuard, inquilinoGuard } from './guards/auth.guard';

export const routes: Routes = [
  // ============================================================
  // ADMIN
  // ============================================================

  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, adminGuard],
  },

  // ============================================================
  // PROPIETARIO
  // ============================================================

  // Al entrar a /propietario,
  // llevar directamente a Mis departamentos.
  {
    path: 'propietario',
    redirectTo: 'mis-departamentos',
    pathMatch: 'full',
  },

  {
    path: 'mis-departamentos',
    component: MisDepartamentosComponent,
    canActivate: [authGuard, propietarioGuard],
  },

  {
    path: 'mis-alquileres',
    component: MisAlquileresComponent,
    canActivate: [authGuard, propietarioGuard],
  },

  {
    path: 'mis-pagos',
    component: MisPagosComponent,
    canActivate: [authGuard, propietarioGuard],
  },

  {
    path: 'publicar',
    component: DepartamentoFormularioComponent,
    canActivate: [authGuard, propietarioGuard],
  },

  // ============================================================
  // INQUILINO
  // ============================================================

  {
    path: 'explorar',
    component: ExplorarComponent,
    canActivate: [authGuard, inquilinoGuard],
  },

  {
    path: 'reservar',
    component: ReservaFormularioComponent,
    canActivate: [authGuard, inquilinoGuard],
  },

  {
    path: 'mis-reservas',
    component: MisReservasComponent,
    canActivate: [authGuard, inquilinoGuard],
  },

  // ============================================================
  // LOGIN
  // ============================================================

  {
    path: 'login',
    component: LoginComponent,
  },

  // ============================================================
  // REGISTRO
  // ============================================================

  {
    path: 'registro',
    component: RegistroComponent,
  },

  // ============================================================
  // INICIO
  // ============================================================

  {
    path: '',
    component: InicioComponent,
    pathMatch: 'full',
  },

  {
    path: 'inicio',
    component: InicioComponent,
  },

  // ============================================================
  // RUTAS DESCONOCIDAS
  // ============================================================

  {
    path: '**',
    redirectTo: '',
  },
];
