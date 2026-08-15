import { Injectable } from '@angular/core';

export type MetodoPago = 'YAPE' | 'PLIN' | 'VISA' | 'MASTERCARD';

export type EstadoPago = 'PROCESANDO' | 'COMPLETADO' | 'REEMBOLSADO';

export interface Pago {
  id: number;

  reservaId: number;

  propietarioEmail: string;
  inquilinoEmail: string;
  inquilinoNombre: string;

  departamento: string;

  monto: number;

  moneda: 'PEN';

  metodo: MetodoPago;

  estado: EstadoPago;

  fecha: string;
}

@Injectable({
  providedIn: 'root',
})
export class PagoService {
  private readonly STORAGE_KEY = 'pagosDepaYa';

  // ============================================================
  // LISTAR
  // ============================================================

  listar(): Pago[] {
    const datos = localStorage.getItem(this.STORAGE_KEY);

    if (!datos) {
      return [];
    }

    try {
      const pagos: Pago[] = JSON.parse(datos);

      return Array.isArray(pagos) ? pagos : [];
    } catch (error) {
      console.error('Error cargando pagos:', error);

      return [];
    }
  }

  // ============================================================
  // GUARDAR
  // ============================================================

  private guardar(pagos: Pago[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pagos));

    // Actualización inmediata dentro
    // de la misma aplicación.
    window.dispatchEvent(new Event('depaya-pagos-actualizados'));
  }

  // ============================================================
  // CREAR PAGO PENDIENTE
  // ============================================================

  crearPagoPendiente(reserva: any, metodo: MetodoPago): Pago {
    const pagos = this.listar();

    const existente = pagos.find((pago) => pago.reservaId === reserva.id);

    if (existente) {
      return existente;
    }

    const nuevoId = pagos.length > 0 ? Math.max(...pagos.map((pago) => pago.id)) + 1 : 1;

    const pago: Pago = {
      id: nuevoId,

      reservaId: reserva.id,

      propietarioEmail: reserva.propietarioEmail,

      inquilinoEmail: reserva.inquilinoEmail,

      inquilinoNombre: reserva.inquilinoNombre,

      departamento: reserva.departamento,

      monto: Number(reserva.total),

      moneda: 'PEN',

      metodo,

      estado: 'PROCESANDO',

      fecha: new Date().toISOString(),
    };

    pagos.push(pago);

    this.guardar(pagos);

    return {
      ...pago,
    };
  }

  // ============================================================
  // CONFIRMAR PAGO
  // ============================================================

  confirmarPago(id: number): boolean {
    const pagos = this.listar();

    const indice = pagos.findIndex((pago) => pago.id === id);

    if (indice === -1) {
      return false;
    }

    pagos[indice] = {
      ...pagos[indice],

      estado: 'COMPLETADO',

      fecha: new Date().toISOString(),
    };

    this.guardar(pagos);

    return true;
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  actualizarPago(pago: Pago): boolean {
    const pagos = this.listar();

    const indice = pagos.findIndex((item) => item.id === pago.id);

    if (indice === -1) {
      return false;
    }

    pagos[indice] = {
      ...pago,
    };

    this.guardar(pagos);

    return true;
  }

  // ============================================================
  // ELIMINAR
  // ============================================================

  eliminarPago(id: number): boolean {
    const pagos = this.listar();

    const nuevos = pagos.filter((pago) => pago.id !== id);

    if (nuevos.length === pagos.length) {
      return false;
    }

    this.guardar(nuevos);

    return true;
  }

  // ============================================================
  // PROPIETARIO
  // ============================================================

  buscarPorPropietario(email: string): Pago[] {
    const correo = email.trim().toLowerCase();

    return this.listar().filter((pago) => pago.propietarioEmail.trim().toLowerCase() === correo);
  }

  // ============================================================
  // INQUILINO
  // ============================================================

  buscarPorInquilino(email: string): Pago[] {
    const correo = email.trim().toLowerCase();

    return this.listar().filter((pago) => pago.inquilinoEmail.trim().toLowerCase() === correo);
  }

  // ============================================================
  // INGRESOS PROPIETARIO
  // ============================================================

  obtenerIngresosPropietario(email: string): number {
    return this.buscarPorPropietario(email)
      .filter((pago) => pago.estado === 'COMPLETADO')
      .reduce(
        (total, pago) => total + Number(pago.monto),

        0,
      );
  }

  // ============================================================
  // TEXTO MÉTODO
  // ============================================================

  obtenerNombreMetodo(metodo: MetodoPago): string {
    switch (metodo) {
      case 'YAPE':
        return 'Yape';

      case 'PLIN':
        return 'Plin';

      case 'VISA':
        return 'Visa';

      case 'MASTERCARD':
        return 'Mastercard';

      default:
        return metodo;
    }
  }
}
