import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { Reserva, ReservaService } from '../../services/reserva.service';

import { MetodoPago, PagoService } from '../../services/pago.service';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reserva-formulario',

  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './reserva-formulario.component.html',

  styleUrls: ['./reserva-formulario.component.css'],
})
export class ReservaFormularioComponent implements OnInit {
  // ============================================================
  // DATOS
  // ============================================================

  departamento: any = null;

  usuarioActual: any = null;

  fechaInicio = '';

  fechaFin = '';

  huespedes = 1;

  noches = 0;

  total = 0;

  // ============================================================
  // PAGO
  // ============================================================

  metodoPago: MetodoPago | null = null;

  numeroTarjeta = '';

  titularTarjeta = '';

  vencimiento = '';

  cvv = '';

  validandoPago = false;

  mensajePago = '';

  errorPago = '';

  constructor(
    private reservaService: ReservaService,

    private pagoService: PagoService,

    private authService: AuthService,

    private router: Router,
  ) {}

  // ============================================================
  // INICIO
  // ============================================================

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActual();

    const datos = localStorage.getItem('departamentoSeleccionado');

    if (!datos) {
      return;
    }

    try {
      this.departamento = JSON.parse(datos);
    } catch (error) {
      console.error('Error cargando departamento:', error);

      this.departamento = null;
    }
  }

  // ============================================================
  // TOTAL
  // ============================================================

  calcularTotal(): void {
    if (!this.fechaInicio || !this.fechaFin || !this.departamento) {
      this.noches = 0;
      this.total = 0;

      return;
    }

    const inicio = new Date(`${this.fechaInicio}T00:00:00`);

    const fin = new Date(`${this.fechaFin}T00:00:00`);

    const diferencia = fin.getTime() - inicio.getTime();

    this.noches = Math.ceil(diferencia / (1000 * 60 * 60 * 24));

    if (this.noches <= 0) {
      this.noches = 0;
      this.total = 0;

      return;
    }

    const precio = Number(this.departamento.Precio_Noche ?? this.departamento.precio ?? 0);

    this.total = this.noches * precio;
  }

  // ============================================================
  // MÉTODO
  // ============================================================

  seleccionarMetodo(metodo: MetodoPago): void {
    this.metodoPago = metodo;

    this.errorPago = '';

    this.mensajePago = '';
  }

  // ============================================================
  // ES QR
  // ============================================================

  get esPagoQR(): boolean {
    return this.metodoPago === 'YAPE' || this.metodoPago === 'PLIN';
  }

  // ============================================================
  // ES TARJETA
  // ============================================================

  get esTarjeta(): boolean {
    return this.metodoPago === 'VISA' || this.metodoPago === 'MASTERCARD';
  }

  // ============================================================
  // QR
  // ============================================================

  get qrPago(): string {
    if (!this.metodoPago || !this.esPagoQR) {
      return '';
    }

    const contenido = [
      'DEPAYA',
      this.metodoPago,
      this.departamento?.Titulo || '',
      `S/${this.total.toFixed(2)}`,
      this.usuarioActual?.email || '',
    ].join('|');

    return (
      'https://api.qrserver.com/v1/create-qr-code/' +
      '?size=230x230' +
      '&margin=8' +
      '&data=' +
      encodeURIComponent(contenido)
    );
  }

  // ============================================================
  // VALIDAR DATOS
  // ============================================================

  private validarReserva(): boolean {
    if (!this.departamento) {
      this.errorPago = 'No se encontró el departamento.';

      return false;
    }

    if (!this.usuarioActual) {
      this.router.navigate(['/login']);

      return false;
    }

    if (this.usuarioActual.rol !== 'INQUILINO') {
      this.errorPago = 'Solo los inquilinos pueden realizar reservas.';

      return false;
    }

    if (!this.fechaInicio || !this.fechaFin) {
      this.errorPago = 'Selecciona las fechas de la reserva.';

      return false;
    }

    this.calcularTotal();

    if (this.noches <= 0) {
      this.errorPago = 'La fecha de salida debe ser posterior a la fecha de ingreso.';

      return false;
    }

    if (!this.metodoPago) {
      this.errorPago = 'Selecciona un método de pago.';

      return false;
    }

    return true;
  }

  // ============================================================
  // VALIDAR TARJETA
  // ============================================================

  private validarTarjeta(): boolean {
    if (!this.esTarjeta) {
      return true;
    }

    const numero = this.numeroTarjeta.replace(/\s/g, '');

    if (!/^\d{16}$/.test(numero)) {
      this.errorPago = 'Ingrese un número de tarjeta válido de 16 dígitos.';

      return false;
    }

    if (!this.titularTarjeta.trim()) {
      this.errorPago = 'Ingrese el nombre del titular.';

      return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(this.vencimiento)) {
      this.errorPago = 'Ingrese el vencimiento en formato MM/AA.';

      return false;
    }

    if (!/^\d{3,4}$/.test(this.cvv)) {
      this.errorPago = 'Ingrese un CVV válido.';

      return false;
    }

    return true;
  }

  // ============================================================
  // PAGAR Y CONFIRMAR
  // ============================================================

  procesarPago(): void {
    this.errorPago = '';

    this.mensajePago = '';

    if (!this.validarReserva()) {
      return;
    }

    if (!this.validarTarjeta()) {
      return;
    }

    if (this.validandoPago) {
      return;
    }

    this.validandoPago = true;

    this.mensajePago = 'Validando pago...';

    // ==========================================================
    // CREAR RESERVA COMO PENDIENTE
    // ==========================================================

    const precio = Number(this.departamento.Precio_Noche ?? this.departamento.precio ?? 0);

    const reservaPendiente: Reserva = {
      id: 0,

      departamentoId: this.departamento.id,

      departamento:
        this.departamento.Titulo ?? this.departamento.titulo ?? this.departamento.nombre,

      ciudad: this.departamento.Distrito ?? this.departamento.distrito ?? '',

      propietarioEmail: this.departamento.propietarioEmail,

      inquilinoEmail: this.usuarioActual.email,

      inquilinoNombre:
        `${this.usuarioActual.nombre || ''} ${this.usuarioActual.apellido || ''}`.trim(),

      fechaInicio: this.fechaInicio,

      fechaFin: this.fechaFin,

      noches: this.noches,

      precioNoche: precio,

      total: this.total,

      estado: 'PENDIENTE',

      fechaReserva: new Date().toISOString(),
    };

    const reservaCreada = this.reservaService.guardar(reservaPendiente);

    const pago = this.pagoService.crearPagoPendiente(reservaCreada, this.metodoPago!);

    // ==========================================================
    // VALIDACIÓN SIMULADA
    // ==========================================================

    setTimeout(() => {
      const pagoConfirmado = this.pagoService.confirmarPago(pago.id);

      if (!pagoConfirmado) {
        this.validandoPago = false;

        this.mensajePago = '';

        this.errorPago = 'No se pudo validar el pago.';

        return;
      }

      const reservaConfirmada = this.reservaService.actualizarEstado(
        reservaCreada.id,
        'CONFIRMADA',
      );

      if (!reservaConfirmada) {
        this.validandoPago = false;

        this.mensajePago = '';

        this.errorPago = 'El pago fue registrado, pero no se pudo confirmar la reserva.';

        return;
      }

      this.validandoPago = false;

      this.mensajePago = 'Pago validado. Reserva confirmada correctamente.';

      localStorage.removeItem('departamentoSeleccionado');

      // NO guardamos número,
      // CVV ni datos sensibles.
      this.numeroTarjeta = '';
      this.cvv = '';
      this.vencimiento = '';
      this.titularTarjeta = '';

      setTimeout(() => {
        this.router.navigate(['/mis-reservas']);
      }, 900);
    }, 1600);
  }

  // ============================================================
  // VOLVER
  // ============================================================

  volverExplorar(): void {
    this.router.navigate(['/explorar']);
  }
}
