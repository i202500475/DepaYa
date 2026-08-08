import { Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component';
import { ExplorarComponent } from './components/explorar/explorar.component';
import { DepartamentoFormularioComponent } from './components/departamento-formulario/departamento-formulario.component';
import { DepartamentoDetalleComponent } from './components/departamento-detalle/departamento-detalle.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'inicio', component: InicioComponent },
  { path: 'explorar', component: ExplorarComponent },
  { path: 'publicar', component: DepartamentoFormularioComponent },
  { path: 'detalle', component: DepartamentoDetalleComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: '**', redirectTo: '' },
];
