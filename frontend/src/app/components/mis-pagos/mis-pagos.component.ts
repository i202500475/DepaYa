import { Component, OnDestroy, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { PagoService } from '../../services/pago.service';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mis-pagos',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './mis-pagos.component.html',

  styleUrls: ['./mis-pagos.component.css'],
})
export class MisPagosComponent implements OnInit, OnDestroy {
  ingresos = 0;

  cantidadPagos = 0;

  propietarioEmail = '';

  private intervalo: ReturnType<typeof setInterval> | null = null;

  constructor(
    private pagoService: PagoService,

    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.cargarIngresos();

    // Eventos dentro de la aplicación.
    window.addEventListener('depaya-pagos-actualizados', this.actualizar);

    // Cambios provenientes de otra pestaña.
    window.addEventListener('storage', this.actualizar);

    // Refuerzo para mantener
    // el dashboard sincronizado.
    this.intervalo = setInterval(() => {
      this.cargarIngresos();
    }, 1500);
  }

  ngOnDestroy(): void {
    window.removeEventListener('depaya-pagos-actualizados', this.actualizar);

    window.removeEventListener('storage', this.actualizar);

    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  private actualizar = (): void => {
    this.cargarIngresos();
  };

  cargarIngresos(): void {
    const usuario = this.authService.obtenerUsuarioActual();

    if (!usuario || usuario.rol !== 'PROPIETARIO') {
      this.ingresos = 0;
      this.cantidadPagos = 0;

      return;
    }

    this.propietarioEmail = usuario.email.trim().toLowerCase();

    const pagos = this.pagoService
      .buscarPorPropietario(this.propietarioEmail)
      .filter((pago) => pago.estado === 'COMPLETADO');

    this.cantidadPagos = pagos.length;

    this.ingresos = pagos.reduce(
      (total, pago) => total + Number(pago.monto),

      0,
    );
  }
}
