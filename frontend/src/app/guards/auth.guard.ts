import { inject } from '@angular/core';

import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

// ============================================================
// OBTENER ROL NORMALIZADO
// ============================================================

function obtenerRol(): string {
  const authService = inject(AuthService);

  const usuario = authService.obtenerUsuarioActual();

  if (!usuario) {
    return '';
  }

  return String(usuario.rol).trim().toUpperCase();
}

// ============================================================
// AUTENTICADO
// ============================================================

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  const router = inject(Router);

  const usuario = authService.obtenerUsuarioActual();

  if (usuario) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

// ============================================================
// ADMIN
// ============================================================

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  const rol = obtenerRol();

  if (rol === 'ADMIN' || rol === 'ADMINISTRADOR') {
    return true;
  }

  if (rol === 'PROPIETARIO') {
    return router.createUrlTree(['/propietario']);
  }

  if (rol === 'INQUILINO') {
    return router.createUrlTree(['/explorar']);
  }

  return router.createUrlTree(['/login']);
};

// ============================================================
// PROPIETARIO
// ============================================================

export const propietarioGuard: CanActivateFn = () => {
  const router = inject(Router);

  const rol = obtenerRol();

  if (rol === 'PROPIETARIO') {
    return true;
  }

  if (rol === 'ADMIN' || rol === 'ADMINISTRADOR') {
    return router.createUrlTree(['/admin']);
  }

  if (rol === 'INQUILINO') {
    return router.createUrlTree(['/explorar']);
  }

  return router.createUrlTree(['/login']);
};

// ============================================================
// INQUILINO
// ============================================================

export const inquilinoGuard: CanActivateFn = () => {
  const router = inject(Router);

  const rol = obtenerRol();

  if (rol === 'INQUILINO') {
    return true;
  }

  if (rol === 'PROPIETARIO') {
    return router.createUrlTree(['/propietario']);
  }

  if (rol === 'ADMIN' || rol === 'ADMINISTRADOR') {
    return router.createUrlTree(['/admin']);
  }

  return router.createUrlTree(['/login']);
};
