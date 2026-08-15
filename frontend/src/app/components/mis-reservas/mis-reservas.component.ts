import { Component, OnDestroy, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Reserva, ReservaService } from '../../services/reserva.service';

import { PagoService } from '../../services/pago.service';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mis-reservas',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './mis-reservas.component.html',

  styleUrls: ['./mis-reservas.component.css'],
})
export class MisReservasComponent implements OnInit, OnDestroy {
  reservas: Reserva[] = [];

  mensaje = '';

  error = '';

  procesandoReservaId: number | null = null;

  constructor(
    private reservaService: ReservaService,

    private pagoService: PagoService,

    private authService: AuthService,
  ) {}

  // ============================================================
  // INICIO
  // ============================================================

  ngOnInit(): void {
    this.sincronizarReembolsos();

    this.cargarReservas();

    window.addEventListener('depaya-reservas-actualizadas', this.actualizar);

    window.addEventListener('depaya-pagos-actualizados', this.actualizar);

    window.addEventListener('storage', this.actualizar);
  }

  ngOnDestroy(): void {
    window.removeEventListener('depaya-reservas-actualizadas', this.actualizar);

    window.removeEventListener('depaya-pagos-actualizados', this.actualizar);

    window.removeEventListener('storage', this.actualizar);
  }

  private actualizar = (): void => {
    this.sincronizarReembolsos();

    this.cargarReservas();
  };

  // ============================================================
  // CARGAR
  // ============================================================

  cargarReservas(): void {
    const usuario = this.authService.obtenerUsuarioActual();

    if (!usuario) {
      this.reservas = [];

      return;
    }

    this.reservas = this.reservaService.buscarPorInquilino(usuario.email);
  }

  // ============================================================
  // REEMBOLSOS AUTOMÁTICOS 48H
  // ============================================================

  private sincronizarReembolsos(): void {
    const vencidos = this.pagoService.procesarReembolsosVencidos();

    vencidos.forEach((pago) => {
      this.reservaService.marcarReembolsoDevuelto(pago.reservaId, pago.metodo, pago.fechaReembolso);
    });
  }

  // ============================================================
  // PUEDE CANCELAR
  // ============================================================

  puedeCancelarConReembolso(reserva: Reserva): boolean {
    return this.reservaService.puedeCancelarConReembolso(reserva);
  }

  // ============================================================
  // FECHA LÍMITE
  // ============================================================

  obtenerFechaLimiteCancelacion(reserva: Reserva): string {
    return this.reservaService.obtenerFechaLimiteCancelacion(reserva);
  }

  // ============================================================
  // MÉTODO DE PAGO
  // ============================================================

  obtenerMetodoPago(reserva: Reserva): string {
    if (reserva.metodoReembolso) {
      return this.pagoService.obtenerNombreMetodo(reserva.metodoReembolso);
    }

    const pago = this.pagoService.obtenerPorReserva(reserva.id);

    if (!pago) {
      return 'No registrado';
    }

    return this.pagoService.obtenerNombreMetodo(pago.metodo);
  }

  // ============================================================
  // CANCELAR
  // ============================================================

  cancelarReserva(reserva: Reserva): void {
    this.error = '';

    this.mensaje = '';

    if (!this.puedeCancelarConReembolso(reserva)) {
      this.error = 'Esta reserva ya no es apta para cancelación con reembolso.';

      return;
    }

    const pago = this.pagoService.obtenerPorReserva(reserva.id);

    if (!pago) {
      this.error = 'No encontramos el pago asociado a esta reserva.';

      return;
    }

    if (pago.estado !== 'COMPLETADO') {
      this.error = 'El pago de esta reserva no se encuentra disponible para reembolso.';

      return;
    }

    const confirmar = window.confirm(
      `¿Deseas cancelar la reserva de "${reserva.departamento}"?\n\n` +
        `Recibirás el reembolso completo de S/ ${Number(reserva.total).toFixed(2)} ` +
        `por ${this.pagoService.obtenerNombreMetodo(pago.metodo)}.\n\n` +
        `La devolución puede tardar hasta 48 horas.`,
    );

    if (!confirmar) {
      return;
    }

    this.procesandoReservaId = reserva.id;

    // PRIMERO SOLICITAMOS REEMBOLSO

    const solicitud = this.pagoService.solicitarReembolso(reserva.id);

    if (!solicitud) {
      this.procesandoReservaId = null;

      this.error = 'No se pudo iniciar el reembolso.';

      return;
    }

    // DESPUÉS CANCELAMOS LA RESERVA

    const cancelada = this.reservaService.cancelarConReembolso(
      reserva.id,
      solicitud.metodo,
      solicitud.fechaSolicitudReembolso!,
      solicitud.fechaLimiteReembolso!,
    );

    if (!cancelada) {
      this.pagoService.revertirSolicitudReembolso(solicitud.id);

      this.procesandoReservaId = null;

      this.error = 'No fue posible cancelar la reserva.';

      return;
    }

    this.procesandoReservaId = null;

    this.mensaje =
      `Reserva cancelada correctamente. ` +
      `El reembolso completo de S/ ${Number(reserva.total).toFixed(2)} ` +
      `será realizado por ${this.pagoService.obtenerNombreMetodo(solicitud.metodo)} ` +
      `en un plazo máximo de 48 horas.`;

    this.cargarReservas();
  }

  // ============================================================
  // FORMATEAR FECHA
  // ============================================================

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) {
      return '-';
    }

    const soloFecha = fecha.includes('T') ? fecha.substring(0, 10) : fecha;

    const partes = soloFecha.split('-');

    if (partes.length !== 3) {
      return fecha;
    }

    return `${partes[2]}/` + `${partes[1]}/` + `${partes[0]}`;
  }

  // ============================================================
  // FECHA + HORA
  // ============================================================

  formatearFechaHora(fecha: string | undefined): string {
    if (!fecha) {
      return '-';
    }

    const valor = new Date(fecha);

    if (Number.isNaN(valor.getTime())) {
      return '-';
    }

    return valor.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
