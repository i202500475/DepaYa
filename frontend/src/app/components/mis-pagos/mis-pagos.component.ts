import { Component, OnDestroy, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Pago, PagoService } from '../../services/pago.service';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mis-pagos',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './mis-pagos.component.html',

  styleUrls: ['./mis-pagos.component.css'],
})
export class MisPagosComponent implements OnInit, OnDestroy {
  // ============================================================
  // CONFIGURACIÓN
  // ============================================================

  readonly porcentajeComision = 10;

  private readonly COMISION_DEPAYA = 0.1;

  // ============================================================
  // DATOS
  // ============================================================

  propietarioEmail = '';

  pagosActivos: Pago[] = [];

  cantidadPagos = 0;

  totalBruto = 0;

  totalComision = 0;

  ingresoNeto = 0;

  private intervalo: ReturnType<typeof setInterval> | null = null;

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private pagoService: PagoService,

    private authService: AuthService,
  ) {}

  // ============================================================
  // INICIO
  // ============================================================

  ngOnInit(): void {
    this.cargarIngresos();

    window.addEventListener('depaya-pagos-actualizados', this.actualizar);

    window.addEventListener('storage', this.actualizar);

    this.intervalo = setInterval(() => {
      this.cargarIngresos();
    }, 1500);
  }

  // ============================================================
  // DESTRUIR
  // ============================================================

  ngOnDestroy(): void {
    window.removeEventListener('depaya-pagos-actualizados', this.actualizar);

    window.removeEventListener('storage', this.actualizar);

    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  // ============================================================
  // EVENTO ACTUALIZACIÓN
  // ============================================================

  private actualizar = (): void => {
    this.cargarIngresos();
  };

  // ============================================================
  // CARGAR PAGOS
  // ============================================================

  cargarIngresos(): void {
    const usuario = this.authService.obtenerUsuarioActual();

    if (!usuario || usuario.rol !== 'PROPIETARIO') {
      this.propietarioEmail = '';

      this.pagosActivos = [];

      this.cantidadPagos = 0;

      this.totalBruto = 0;

      this.totalComision = 0;

      this.ingresoNeto = 0;

      return;
    }

    this.propietarioEmail = usuario.email.trim().toLowerCase();

    /*
      Solo los pagos COMPLETADOS
      cuentan como ingresos.

      Si el inquilino solicita
      reembolso, el pago cambia a
      REEMBOLSO_PENDIENTE y
      automáticamente desaparece
      de estos cálculos.
    */

    this.pagosActivos = this.pagoService
      .buscarPorPropietario(this.propietarioEmail)
      .filter((pago) => pago.estado === 'COMPLETADO')
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    this.cantidadPagos = this.pagosActivos.length;

    // TOTAL PAGADO POR INQUILINOS

    this.totalBruto = this.pagosActivos.reduce(
      (total, pago) => total + Number(pago.monto),

      0,
    );

    // COMISIÓN DEPAYA

    this.totalComision = this.totalBruto * this.COMISION_DEPAYA;

    // NETO DEL PROPIETARIO

    this.ingresoNeto = this.totalBruto - this.totalComision;
  }

  // ============================================================
  // COMISIÓN DE UN PAGO
  // ============================================================

  calcularComision(pago: Pago): number {
    if (pago.estado !== 'COMPLETADO') {
      return 0;
    }

    return Number(pago.monto) * this.COMISION_DEPAYA;
  }

  // ============================================================
  // NETO DE UN PAGO
  // ============================================================

  calcularNeto(pago: Pago): number {
    if (pago.estado !== 'COMPLETADO') {
      return 0;
    }

    return Number(pago.monto) - this.calcularComision(pago);
  }

  // ============================================================
  // MÉTODO
  // ============================================================

  obtenerMetodoPago(pago: Pago): string {
    return this.pagoService.obtenerNombreMetodo(pago.metodo);
  }
}
