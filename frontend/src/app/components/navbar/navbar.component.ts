import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService, Usuario } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',

  standalone: true,

  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],

  templateUrl: './navbar.component.html',

  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  usuarioActual: Usuario | null = null;

  menuOpen = false;

  busquedaHuesped = '';

  constructor(
    private authService: AuthService,

    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cargarUsuario();
  }

  // ============================================================
  // USUARIO
  // ============================================================

  cargarUsuario(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActual();
  }

  // ============================================================
  // LOGIN
  // ============================================================

  get estaLogueado(): boolean {
    return this.usuarioActual !== null;
  }

  // ============================================================
  // ROLES
  // ============================================================

  get esAdmin(): boolean {
    const rol = String(this.usuarioActual?.rol || '')
      .trim()
      .toUpperCase();

    return rol === 'ADMIN' || rol === 'ADMINISTRADOR';
  }

  get esPropietario(): boolean {
    return (
      String(this.usuarioActual?.rol || '')
        .trim()
        .toUpperCase() === 'PROPIETARIO'
    );
  }

  get esInquilino(): boolean {
    return (
      String(this.usuarioActual?.rol || '')
        .trim()
        .toUpperCase() === 'INQUILINO'
    );
  }

  // ============================================================
  // BUSCAR HUÉSPED
  // ============================================================

  buscarHuesped(): void {
    const texto = this.busquedaHuesped.trim();

    this.menuOpen = false;

    if (!texto) {
      this.router.navigate(['/mis-alquileres']);

      return;
    }

    this.router.navigate(['/mis-alquileres'], {
      queryParams: {
        buscar: texto,
      },
    });
  }

  // ============================================================
  // MENÚ
  // ============================================================

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  cerrarMenu(): void {
    this.menuOpen = false;
  }

  // ============================================================
  // CERRAR SESIÓN
  // ============================================================

  cerrarSesion(): void {
    this.authService.cerrarSesion();

    this.usuarioActual = null;

    this.menuOpen = false;

    this.router.navigate(['/login']);
  }
}
