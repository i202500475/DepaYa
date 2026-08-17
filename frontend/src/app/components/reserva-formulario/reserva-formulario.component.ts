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
  // DATOS GENERALES
  // ============================================================

  departamento: any = null;

  usuarioActual: any = null;

  // ============================================================
  // FECHAS
  // ============================================================

  fechaInicio = '';

  fechaFin = '';

  fechaMinima = '';

  huespedes = 1;

  noches = 0;

  total = 0;

  // ============================================================
  // DISPONIBILIDAD
  // ============================================================

  departamentoDisponible: boolean | null = null;

  verificandoDisponibilidad = false;

  mensajeDisponibilidad = '';

  conflictosDisponibilidad: Reserva[] = [];

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

  // ============================================================
  // TÉRMINOS Y CONDICIONES
  // ============================================================

  aceptaTerminos = false;

  modalTerminosVisible = false;

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

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
    this.fechaMinima = this.obtenerFechaHoyLocal();

    this.usuarioActual = this.authService.obtenerUsuarioActual();

    const datos = localStorage.getItem('departamentoSeleccionado');

    if (!datos) {
      this.errorPago = 'No se encontró el departamento seleccionado.';

      return;
    }

    try {
      this.departamento = JSON.parse(datos);

      const huespedesGuardados = Number(localStorage.getItem('huespedesSeleccionados'));

      if (Number.isFinite(huespedesGuardados) && huespedesGuardados >= 1) {
        this.huespedes = Math.floor(huespedesGuardados);
      }

      this.validarHuespedesEnTiempoReal();
    } catch (error) {
      console.error('Error cargando departamento:', error);

      this.departamento = null;

      this.errorPago = 'No se pudo cargar la información del departamento.';
    }
  }

  // ============================================================
  // FECHA ACTUAL LOCAL
  // ============================================================

  private obtenerFechaHoyLocal(): string {
    const ahora = new Date();

    const anio = ahora.getFullYear();

    const mes = String(ahora.getMonth() + 1).padStart(2, '0');

    const dia = String(ahora.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  // ============================================================
  // EVENTO CAMBIO DE FECHAS
  //
  // Puedes llamar este método desde el HTML:
  //
  // (ngModelChange)="actualizarReserva()"
  // ============================================================

  actualizarReserva(): void {
    this.errorPago = '';

    this.mensajePago = '';

    this.calcularTotal();

    this.verificarDisponibilidad();
  }

  // ============================================================
  // CALCULAR TOTAL
  // ============================================================

  calcularTotal(): void {
    this.noches = 0;

    this.total = 0;

    if (!this.fechaInicio || !this.fechaFin || !this.departamento) {
      return;
    }

    this.noches = this.reservaService.calcularNoches(this.fechaInicio, this.fechaFin);

    if (this.noches <= 0) {
      return;
    }

    const precio = this.obtenerPrecioNoche();

    this.total = this.noches * precio;
  }

  // ============================================================
  // PRECIO POR NOCHE
  // ============================================================

  private obtenerPrecioNoche(): number {
    return Number(
      this.departamento?.Precio_Noche ??
        this.departamento?.precio ??
        this.departamento?.precioNoche ??
        0,
    );
  }

  // ============================================================
  // CAPACIDAD
  // ============================================================

  get capacidadMaxima(): number {
    return Number(this.departamento?.Capacidad ?? this.departamento?.capacidad ?? 0);
  }

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

  get capacidadSuperada(): boolean {
    return this.capacidadMaxima > 0 && Number(this.huespedes) > this.capacidadMaxima;
  }

  get descripcionDepartamento(): string {
    return (
      this.departamento?.Descripcion ??
      this.departamento?.descripcion ??
      'El propietario no agregó una descripción para este alojamiento.'
    );
  }

  validarHuespedesEnTiempoReal(): void {
    this.errorPago = '';

    const cantidad = Number(this.huespedes);

    if (!Number.isFinite(cantidad) || cantidad < 1) {
      return;
    }

    this.huespedes = Math.floor(cantidad);
  }

  // ============================================================
  // TÉRMINOS Y CONDICIONES
  // ============================================================

  abrirTerminos(): void {
    this.modalTerminosVisible = true;
  }

  cerrarTerminos(): void {
    this.modalTerminosVisible = false;
  }

  // ============================================================
  // VERIFICAR DISPONIBILIDAD
  // ============================================================

  verificarDisponibilidad(): void {
    this.departamentoDisponible = null;

    this.mensajeDisponibilidad = '';

    this.conflictosDisponibilidad = [];

    if (!this.departamento || !this.fechaInicio || !this.fechaFin) {
      return;
    }

    if (!this.reservaService.fechasValidas(this.fechaInicio, this.fechaFin)) {
      this.departamentoDisponible = false;

      this.mensajeDisponibilidad = 'La fecha de salida debe ser posterior a la fecha de ingreso.';

      return;
    }

    this.verificandoDisponibilidad = true;

    const departamentoId = Number(this.departamento.id);

    const conflictos = this.reservaService.obtenerConflictos(
      departamentoId,
      this.fechaInicio,
      this.fechaFin,
    );

    this.conflictosDisponibilidad = conflictos;

    if (conflictos.length > 0) {
      this.departamentoDisponible = false;

      const conflicto = conflictos[0];

      this.mensajeDisponibilidad = `No disponible. Este departamento ya está reservado del ${this.formatearFecha(
        conflicto.fechaInicio,
      )} al ${this.formatearFecha(conflicto.fechaFin)}.`;
    } else {
      this.departamentoDisponible = true;

      this.mensajeDisponibilidad = 'Disponible para las fechas seleccionadas.';
    }

    this.verificandoDisponibilidad = false;
  }

  // ============================================================
  // FORMATEAR FECHA
  // yyyy-mm-dd -> dd/mm/yyyy
  // ============================================================

  formatearFecha(fecha: string): string {
    if (!fecha) {
      return '';
    }

    const partes = fecha.split('-');

    if (partes.length !== 3) {
      return fecha;
    }

    return `${partes[2]}/` + `${partes[1]}/` + `${partes[0]}`;
  }

  // ============================================================
  // MÉTODO DE PAGO
  // ============================================================

  seleccionarMetodo(metodo: MetodoPago): void {
    this.metodoPago = metodo;

    this.errorPago = '';

    this.mensajePago = '';

    /*
      Limpiar tarjeta si cambia
      a Yape o Plin.
    */

    if (metodo === 'YAPE' || metodo === 'PLIN') {
      this.numeroTarjeta = '';

      this.titularTarjeta = '';

      this.vencimiento = '';

      this.cvv = '';
    }
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
  // GENERAR QR DEMO
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
  // VALIDAR RESERVA
  // ============================================================

  private validarReserva(): boolean {
    this.errorPago = '';

    // ----------------------------------------------------------
    // DEPARTAMENTO
    // ----------------------------------------------------------

    if (!this.departamento) {
      this.errorPago = 'No se encontró el departamento.';

      return false;
    }

    // ----------------------------------------------------------
    // USUARIO
    // ----------------------------------------------------------

    if (!this.usuarioActual) {
      this.router.navigate(['/login']);

      return false;
    }

    // ----------------------------------------------------------
    // ROL
    // ----------------------------------------------------------

    if (this.usuarioActual.rol !== 'INQUILINO') {
      this.errorPago = 'Solo los inquilinos pueden realizar reservas.';

      return false;
    }

    // ----------------------------------------------------------
    // FECHAS
    // ----------------------------------------------------------

    if (!this.fechaInicio || !this.fechaFin) {
      this.errorPago = 'Selecciona las fechas de la reserva.';

      return false;
    }

    // ----------------------------------------------------------
    // FECHA PASADA
    // ----------------------------------------------------------

    if (this.fechaInicio < this.fechaMinima) {
      this.errorPago = 'La fecha de ingreso no puede ser anterior a hoy.';

      return false;
    }

    // ----------------------------------------------------------
    // SALIDA POSTERIOR
    // ----------------------------------------------------------

    if (!this.reservaService.fechasValidas(this.fechaInicio, this.fechaFin)) {
      this.errorPago = 'La fecha de salida debe ser posterior a la fecha de ingreso.';

      return false;
    }

    // ----------------------------------------------------------
    // TOTAL
    // ----------------------------------------------------------

    this.calcularTotal();

    if (this.noches <= 0) {
      this.errorPago = 'Selecciona un rango de fechas válido.';

      return false;
    }

    // ----------------------------------------------------------
    // HUÉSPEDES
    // ----------------------------------------------------------

    if (!this.huespedes || this.huespedes < 1) {
      this.errorPago = 'Debe ingresar al menos un huésped.';

      return false;
    }

    if (this.capacidadMaxima > 0 && this.huespedes > this.capacidadMaxima) {
      this.errorPago = `Este departamento admite como máximo ${this.capacidadMaxima} huésped(es).`;

      return false;
    }

    // ----------------------------------------------------------
    // TÉRMINOS Y CONDICIONES
    // ----------------------------------------------------------

    if (!this.aceptaTerminos) {
      this.errorPago = 'Debes leer y aceptar los Términos y condiciones antes de pagar.';

      return false;
    }

    // ----------------------------------------------------------
    // DISPONIBILIDAD
    // ----------------------------------------------------------

    const disponible = this.reservaService.estaDisponible(
      Number(this.departamento.id),
      this.fechaInicio,
      this.fechaFin,
    );

    if (!disponible) {
      this.departamentoDisponible = false;

      const conflictos = this.reservaService.obtenerConflictos(
        Number(this.departamento.id),
        this.fechaInicio,
        this.fechaFin,
      );

      this.conflictosDisponibilidad = conflictos;

      if (conflictos.length > 0) {
        const conflicto = conflictos[0];

        this.mensajeDisponibilidad = `No disponible del ${this.formatearFecha(
          conflicto.fechaInicio,
        )} al ${this.formatearFecha(conflicto.fechaFin)}.`;
      }

      this.errorPago =
        'Este departamento ya está reservado en las fechas seleccionadas. Elige otras fechas.';

      return false;
    }

    this.departamentoDisponible = true;

    // ----------------------------------------------------------
    // MÉTODO DE PAGO
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // NÚMERO
    // ----------------------------------------------------------

    const numero = this.numeroTarjeta.replace(/\s/g, '');

    if (!/^\d{16}$/.test(numero)) {
      this.errorPago = 'Ingrese un número de tarjeta válido de 16 dígitos.';

      return false;
    }

    // ----------------------------------------------------------
    // TITULAR
    // ----------------------------------------------------------

    if (!this.titularTarjeta.trim()) {
      this.errorPago = 'Ingrese el nombre del titular de la tarjeta.';

      return false;
    }

    // ----------------------------------------------------------
    // VENCIMIENTO
    // ----------------------------------------------------------

    if (!/^\d{2}\/\d{2}$/.test(this.vencimiento)) {
      this.errorPago = 'Ingrese el vencimiento en formato MM/AA.';

      return false;
    }

    const [mesTexto, anioTexto] = this.vencimiento.split('/');

    const mes = Number(mesTexto);

    const anio = 2000 + Number(anioTexto);

    if (mes < 1 || mes > 12) {
      this.errorPago = 'El mes de vencimiento no es válido.';

      return false;
    }

    const ahora = new Date();

    const tarjetaVencida =
      anio < ahora.getFullYear() || (anio === ahora.getFullYear() && mes < ahora.getMonth() + 1);

    if (tarjetaVencida) {
      this.errorPago = 'La tarjeta se encuentra vencida.';

      return false;
    }

    // ----------------------------------------------------------
    // CVV
    // ----------------------------------------------------------

    if (!/^\d{3,4}$/.test(this.cvv)) {
      this.errorPago = 'Ingrese un CVV válido.';

      return false;
    }

    return true;
  }

  // ============================================================
  // SABER SI PUEDE PAGAR
  //
  // Puedes usarlo en HTML:
  //
  // [disabled]="!puedePagar"
  // ============================================================

  get puedePagar(): boolean {
    return (
      !!this.departamento &&
      !!this.fechaInicio &&
      !!this.fechaFin &&
      this.noches > 0 &&
      this.departamentoDisponible === true &&
      this.huespedesValidos &&
      this.aceptaTerminos &&
      !!this.metodoPago &&
      !this.validandoPago
    );
  }

  // ============================================================
  // PAGAR Y CONFIRMAR
  // ============================================================

  procesarPago(): void {
    this.errorPago = '';

    this.mensajePago = '';

    // ----------------------------------------------------------
    // VALIDAR RESERVA
    // ----------------------------------------------------------

    if (!this.validarReserva()) {
      return;
    }

    // ----------------------------------------------------------
    // VALIDAR TARJETA
    // ----------------------------------------------------------

    if (!this.validarTarjeta()) {
      return;
    }

    if (this.validandoPago) {
      return;
    }

    /*
      MUY IMPORTANTE:

      Volvemos a revisar disponibilidad
      inmediatamente antes de guardar.

      Así evitamos que el usuario tenga
      la pantalla abierta y otra persona
      reserve mientras tanto.
    */

    const disponibleAhora = this.reservaService.estaDisponible(
      Number(this.departamento.id),
      this.fechaInicio,
      this.fechaFin,
    );

    if (!disponibleAhora) {
      this.departamentoDisponible = false;

      this.verificarDisponibilidad();

      this.errorPago =
        'Lo sentimos. Estas fechas acaban de dejar de estar disponibles. Selecciona otras fechas.';

      return;
    }

    this.validandoPago = true;

    this.mensajePago = 'Validando disponibilidad y procesando pago...';

    // ==========================================================
    // DATOS RESERVA
    // ==========================================================

    const precio = this.obtenerPrecioNoche();

    const reservaPendiente: Reserva = {
      id: 0,

      departamentoId: Number(this.departamento.id),

      departamento:
        this.departamento.Titulo ??
        this.departamento.titulo ??
        this.departamento.nombre ??
        'Departamento',

      ciudad: this.departamento.Distrito ?? this.departamento.distrito ?? '',

      propietarioEmail: this.departamento.propietarioEmail,

      inquilinoEmail: this.usuarioActual.email,

      inquilinoNombre: `${this.usuarioActual.nombre || ''} ${
        this.usuarioActual.apellido || ''
      }`.trim(),

      huespedes: Math.floor(Number(this.huespedes)),

      fechaInicio: this.fechaInicio,

      fechaFin: this.fechaFin,

      noches: this.noches,

      precioNoche: precio,

      total: this.total,

      estado: 'PENDIENTE',

      fechaReserva: new Date().toISOString(),
    };

    // ==========================================================
    // CREAR RESERVA
    // ==========================================================

    let reservaCreada: Reserva;

    try {
      /*
        ReservaService vuelve a comprobar
        internamente que las fechas estén
        libres.
      */

      reservaCreada = this.reservaService.guardar(reservaPendiente);
    } catch (error: any) {
      this.validandoPago = false;

      this.mensajePago = '';

      this.departamentoDisponible = false;

      this.verificarDisponibilidad();

      this.errorPago =
        error?.message || 'No se pudo crear la reserva porque las fechas ya no están disponibles.';

      return;
    }

    // ==========================================================
    // CREAR PAGO PENDIENTE
    // ==========================================================

    let pago: any;

    try {
      pago = this.pagoService.crearPagoPendiente(reservaCreada, this.metodoPago!);
    } catch (error) {
      /*
        Si falla la creación del pago,
        cancelar la reserva para liberar
        inmediatamente las fechas.
      */

      this.reservaService.cancelarReserva(reservaCreada.id);

      this.validandoPago = false;

      this.mensajePago = '';

      this.errorPago = 'No se pudo iniciar el proceso de pago. Inténtalo nuevamente.';

      return;
    }

    // ==========================================================
    // VALIDACIÓN SIMULADA DEL PAGO
    // ==========================================================

    setTimeout(() => {
      try {
        const pagoConfirmado = this.pagoService.confirmarPago(pago.id);

        // ----------------------------------------------------
        // PAGO FALLÓ
        // ----------------------------------------------------

        if (!pagoConfirmado) {
          /*
              Liberar fechas.
            */

          this.reservaService.cancelarReserva(reservaCreada.id);

          this.validandoPago = false;

          this.mensajePago = '';

          this.errorPago = 'No se pudo validar el pago. La reserva fue liberada.';

          this.verificarDisponibilidad();

          return;
        }

        // ----------------------------------------------------
        // CONFIRMAR RESERVA
        // ----------------------------------------------------

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

        // ====================================================
        // ÉXITO
        // ====================================================

        this.validandoPago = false;

        this.departamentoDisponible = false;

        this.mensajeDisponibilidad = 'Estas fechas quedaron reservadas para ti.';

        this.mensajePago = 'Pago validado. Reserva confirmada correctamente.';

        localStorage.removeItem('departamentoSeleccionado');
        localStorage.removeItem('huespedesSeleccionados');

        /*
            Nunca guardar datos sensibles
            de tarjeta.
          */

        this.numeroTarjeta = '';

        this.cvv = '';

        this.vencimiento = '';

        this.titularTarjeta = '';

        setTimeout(() => {
          this.router.navigate(['/mis-reservas']);
        }, 900);
      } catch (error) {
        console.error('Error procesando pago:', error);

        /*
            En caso de error inesperado
            liberar la reserva pendiente.
          */

        this.reservaService.cancelarReserva(reservaCreada.id);

        this.validandoPago = false;

        this.mensajePago = '';

        this.errorPago = 'Ocurrió un problema procesando el pago. Inténtalo nuevamente.';

        this.verificarDisponibilidad();
      }
    }, 1600);
  }

  // ============================================================
  // VOLVER A EXPLORAR
  // ============================================================

  volverExplorar(): void {
    this.router.navigate(['/explorar']);
  }
}
