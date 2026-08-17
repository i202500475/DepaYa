import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { Departamento, DepartamentoService } from '../../services/departamento.service';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-detalle-departamento',

  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './detalle-departamento.component.html',

  styleUrls: ['./detalle-departamento.component.css'],
})
export class DetalleDepartamentoComponent implements OnInit {
  // ============================================================
  // DEPARTAMENTO
  // ============================================================

  departamento: Departamento | null = null;

  // ============================================================
  // USUARIO
  // ============================================================

  usuarioActual: any = null;

  // ============================================================
  // HUÉSPEDES
  // ============================================================

  huespedes: number | null = 1;

  // ============================================================
  // MENSAJE
  // ============================================================

  error = '';

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private departamentoService: DepartamentoService,

    private authService: AuthService,

    private router: Router,
  ) {}

  // ============================================================
  // INICIO
  // ============================================================

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActual();

    this.cargarDepartamento();

    this.cargarHuespedes();
  }

  // ============================================================
  // CARGAR DEPARTAMENTO
  // ============================================================

  private cargarDepartamento(): void {
    const datos = localStorage.getItem('departamentoSeleccionado');

    if (!datos) {
      this.error = 'No se encontró el departamento seleccionado.';

      return;
    }

    try {
      const seleccionado: Departamento = JSON.parse(datos);

      if (!seleccionado || seleccionado.id == null) {
        this.error = 'No se pudo identificar el departamento.';

        return;
      }

      /*
        Buscamos nuevamente el departamento
        en el servicio para obtener el estado
        más reciente de la publicación.
      */

      const actualizado = this.departamentoService.getDepartamentoById(Number(seleccionado.id));

      if (!actualizado) {
        this.error = 'Este departamento ya no se encuentra disponible.';

        return;
      }

      if (actualizado.Activo === false) {
        this.error =
          'Este departamento fue desactivado por el propietario y ya no acepta nuevas reservas.';

        return;
      }

      this.departamento = actualizado;

      /*
        Actualizamos también localStorage
        con la información más reciente.
      */

      localStorage.setItem(
        'departamentoSeleccionado',

        JSON.stringify(actualizado),
      );
    } catch (error) {
      console.error('Error cargando departamento:', error);

      this.error = 'No se pudo cargar la información del departamento.';
    }
  }

  // ============================================================
  // CARGAR HUÉSPEDES
  // ============================================================

  private cargarHuespedes(): void {
    const guardados = Number(localStorage.getItem('huespedesSeleccionados'));

    if (Number.isFinite(guardados) && guardados >= 1) {
      this.huespedes = Math.floor(guardados);

      return;
    }

    this.huespedes = 1;
  }

  // ============================================================
  // CAPACIDAD
  // ============================================================

  get capacidadMaxima(): number {
    return Number(this.departamento?.Capacidad ?? 0);
  }

  // ============================================================
  // HUÉSPEDES VÁLIDOS
  // ============================================================

  get huespedesValidos(): boolean {
    const cantidad = Number(this.huespedes);

    if (!Number.isFinite(cantidad) || cantidad < 1) {
      return false;
    }

    if (this.capacidadMaxima > 0 && cantidad > this.capacidadMaxima) {
      return false;
    }

    return true;
  }

  // ============================================================
  // CAPACIDAD SUPERADA
  // ============================================================

  get capacidadSuperada(): boolean {
    if (this.capacidadMaxima <= 0) {
      return false;
    }

    return Number(this.huespedes) > this.capacidadMaxima;
  }

  // ============================================================
  // NORMALIZAR HUÉSPEDES
  // ============================================================

  normalizarHuespedes(): void {
    if (this.huespedes === null) {
      return;
    }

    const cantidad = Number(this.huespedes);

    if (!Number.isFinite(cantidad)) {
      this.huespedes = 1;

      return;
    }

    if (cantidad < 1) {
      this.huespedes = 1;

      return;
    }

    this.huespedes = Math.floor(cantidad);
  }

  // ============================================================
  // DESCRIPCIÓN
  // ============================================================

  get descripcion(): string {
    const texto = (this.departamento?.Descripcion || '').trim();

    return texto || 'El propietario no agregó una descripción para este alojamiento.';
  }

  // ============================================================
  // SERVICIOS
  // ============================================================

  get tieneServicios(): boolean {
    return Boolean(
      this.departamento?.TienePiscina ||
      this.departamento?.TieneWifi ||
      this.departamento?.AdmiteMascotas,
    );
  }

  // ============================================================
  // PRECIO
  // ============================================================

  get precioNoche(): number {
    return Number(this.departamento?.Precio_Noche ?? 0);
  }

  // ============================================================
  // VOLVER
  // ============================================================

  volverExplorar(): void {
    this.router.navigate(['/explorar']);
  }

  // ============================================================
  // RESERVAR
  // ============================================================

  reservarAhora(): void {
    if (!this.departamento) {
      return;
    }

    if (this.departamento.Activo === false) {
      this.error = 'Este departamento ya no se encuentra disponible.';

      return;
    }

    this.normalizarHuespedes();

    if (!this.huespedesValidos) {
      return;
    }

    if (!this.usuarioActual) {
      this.router.navigate(['/login']);

      return;
    }

    if (this.usuarioActual.rol !== 'INQUILINO') {
      this.error = 'Solo los inquilinos pueden realizar reservas.';

      return;
    }

    /*
      Guardamos nuevamente los datos
      antes de entrar al formulario
      de reserva.
    */

    localStorage.setItem(
      'departamentoSeleccionado',

      JSON.stringify(this.departamento),
    );

    localStorage.setItem(
      'huespedesSeleccionados',

      String(Number(this.huespedes)),
    );

    this.router.navigate(['/reservar']);
  }
}
