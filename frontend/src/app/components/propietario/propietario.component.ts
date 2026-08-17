import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router, RouterModule } from '@angular/router';

import { AuthService, Usuario } from '../../services/auth.service';

import { Departamento, DepartamentoService } from '../../services/departamento.service';

import { Reserva, ReservaService } from '../../services/reserva.service';

@Component({
  selector: 'app-propietario',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './propietario.component.html',
  styleUrls: ['./propietario.component.css'],
})
export class PropietarioComponent implements OnInit {
  // ============================================================
  // USUARIO
  // ============================================================

  usuarioActual: Usuario | null = null;

  // ============================================================
  // INFORMACIÓN
  // ============================================================

  departamentos: Departamento[] = [];
  reservas: Reserva[] = [];

  // ============================================================
  // MENSAJES
  // ============================================================

  mensaje = '';
  error = '';
  procesando = false;

  constructor(
    private authService: AuthService,
    private departamentoService: DepartamentoService,
    private reservaService: ReservaService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActual();

    if (!this.usuarioActual) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.usuarioActual.rol !== 'PROPIETARIO') {
      this.router.navigate(['/']);
      return;
    }

    this.cargarDatos();
  }

  // ============================================================
  // CARGAR DATOS
  // ============================================================

  cargarDatos(): void {
    const usuario = this.authService.obtenerUsuarioActual();

    if (usuario) {
      this.usuarioActual = usuario;
    }

    if (!this.usuarioActual) {
      return;
    }

    const correo = this.usuarioActual.email;

    this.departamentos = this.departamentoService.getDepartamentosPorPropietario(correo);

    this.reservas = this.reservaService.buscarPorPropietario(correo);
  }

  // ============================================================
  // FECHA ACTUAL
  // ============================================================

  private obtenerHoy(): string {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  // ============================================================
  // RESERVAS QUE BLOQUEAN LA BAJA DE CUENTA
  // ============================================================

  private reservaBloqueaCierre(reserva: Reserva): boolean {
    if (reserva.estado === 'CANCELADA') {
      return false;
    }

    if (reserva.estado !== 'CONFIRMADA' && reserva.estado !== 'PENDIENTE') {
      return false;
    }

    const hoy = this.obtenerHoy();

    // Si la salida es hoy, la reserva todavía se considera vigente.
    return reserva.fechaFin >= hoy;
  }

  get reservasPendientesCierre(): Reserva[] {
    return this.reservas
      .filter((reserva) => this.reservaBloqueaCierre(reserva))
      .sort((a, b) => a.fechaFin.localeCompare(b.fechaFin));
  }

  get puedeDesactivarCuenta(): boolean {
    return this.reservasPendientesCierre.length === 0;
  }

  get fechaUltimaReserva(): string {
    const reservas = this.reservasPendientesCierre;

    if (reservas.length === 0) {
      return '';
    }

    return reservas[reservas.length - 1].fechaFin;
  }

  // ============================================================
  // DEPARTAMENTOS
  // ============================================================

  get departamentosActivos(): Departamento[] {
    return this.departamentos.filter((departamento) => departamento.Activo !== false);
  }

  get departamentosInactivos(): Departamento[] {
    return this.departamentos.filter((departamento) => departamento.Activo === false);
  }

  get tieneDepartamentosActivos(): boolean {
    return this.departamentosActivos.length > 0;
  }

  get publicacionesBloqueadas(): boolean {
    return this.usuarioActual?.PublicacionesHabilitadas === false;
  }

  // ============================================================
  // DESACTIVAR PUBLICACIONES
  // ============================================================

  desactivarDepartamentos(): void {
    this.limpiarMensajes();

    if (!this.usuarioActual || this.usuarioActual.id == null) {
      this.error = 'No se pudo identificar tu cuenta.';
      return;
    }

    if (this.publicacionesBloqueadas) {
      this.error =
        'Tus publicaciones ya están desactivadas. Para volver a activarlas debes comunicarte con el administrador de DepaYa.';
      return;
    }

    const confirmar = window.confirm(
      '¿Deseas desactivar tus publicaciones?\n\n' +
        'Tus departamentos dejarán de aparecer en Explorar y no recibirán nuevas reservas.\n\n' +
        'IMPORTANTE: después de desactivarlas NO podrás volver a activarlas por tu cuenta. ' +
        'Si cambias de decisión, tendrás que comunicarte con el administrador de DepaYa para solicitar la reactivación.\n\n' +
        'Las reservas existentes no serán canceladas.',
    );

    if (!confirmar) {
      return;
    }

    this.procesando = true;

    try {
      const cantidad = this.departamentoService.desactivarDepartamentosPropietario(
        this.usuarioActual.email,
      );

      const bloqueado = this.authService.bloquearPublicacionesPropietario(this.usuarioActual.id);

      if (!bloqueado) {
        this.error = 'No se pudo bloquear la publicación de nuevos departamentos.';
        return;
      }

      this.cargarDatos();

      this.mensaje =
        cantidad > 0
          ? 'Tus publicaciones fueron desactivadas. Si cambias de decisión, deberás comunicarte con el administrador de DepaYa para que las reactive.'
          : 'Tu cuenta quedó bloqueada para nuevas publicaciones. Si deseas volver a publicar, deberás comunicarte con el administrador de DepaYa.';
    } catch (error) {
      console.error('Error desactivando publicaciones:', error);

      this.error = 'No se pudieron desactivar tus publicaciones.';
    } finally {
      this.procesando = false;
    }
  }

  // ============================================================
  // DESACTIVAR CUENTA
  // ============================================================

  desactivarCuenta(): void {
    this.limpiarMensajes();

    if (!this.usuarioActual || this.usuarioActual.id == null) {
      this.error = 'No se pudo identificar tu cuenta.';
      return;
    }

    this.cargarDatos();

    if (!this.puedeDesactivarCuenta) {
      this.error =
        'No puedes desactivar tu cuenta porque todavía tienes una reserva activa o futura. Puedes desactivar tus publicaciones y esperar hasta que finalice tu última reserva.';
      return;
    }

    const confirmar = window.confirm(
      '¿Estás seguro de que deseas desactivar tu cuenta de DepaYa?\n\n' +
        'Tus departamentos dejarán de estar disponibles y se cerrará tu sesión.\n\n' +
        'IMPORTANTE: no podrás reactivar la cuenta por tu cuenta. ' +
        'Si te arrepientes, tendrás que comunicarte con el administrador de DepaYa para solicitar la reactivación.',
    );

    if (!confirmar) {
      return;
    }

    const confirmarFinal = window.confirm(
      'CONFIRMACIÓN FINAL\n\n' +
        'Tu cuenta quedará INACTIVA y solo un administrador podrá volver a habilitarla.\n\n' +
        '¿Deseas continuar?',
    );

    if (!confirmarFinal) {
      return;
    }

    this.procesando = true;

    try {
      this.departamentoService.desactivarDepartamentosPropietario(this.usuarioActual.email);

      const desactivada = this.authService.desactivarCuenta(this.usuarioActual.id);

      if (!desactivada) {
        this.error = 'No se pudo desactivar tu cuenta.';
        return;
      }

      localStorage.removeItem('departamentoSeleccionado');
      localStorage.removeItem('huespedesSeleccionados');

      window.alert(
        'Tu cuenta fue desactivada correctamente.\n\n' +
          'Si cambias de decisión y deseas volver a usar DepaYa, deberás comunicarte con el administrador para que reactive tu cuenta y tus publicaciones.',
      );

      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error desactivando cuenta:', error);

      this.error = 'Ocurrió un error al desactivar la cuenta.';
    } finally {
      this.procesando = false;
    }
  }

  private limpiarMensajes(): void {
    this.mensaje = '';
    this.error = '';
  }
}
