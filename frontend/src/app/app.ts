import { Component } from '@angular/core';

import { Router, RouterOutlet } from '@angular/router';

import { CommonModule } from '@angular/common';

import { NavbarComponent } from './components/navbar/navbar.component';

import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',

  standalone: true,

  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],

  templateUrl: './app.html',

  styleUrls: ['./app.css'],
})
export class App {
  title = 'DepaYa';

  // ============================================================
  // RUTAS SIN NAVBAR NI FOOTER
  // ============================================================

  private readonly rutasAuth = ['/login', '/registro'];

  constructor(private router: Router) {}

  // ============================================================
  // COMPROBAR RUTA
  // ============================================================

  get esRutaAuth(): boolean {
    const rutaActual = this.router.url.split('?')[0].split('#')[0];

    return this.rutasAuth.includes(rutaActual);
  }
}
