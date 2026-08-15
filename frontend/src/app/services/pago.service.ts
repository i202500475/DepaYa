import { Injectable } from '@angular/core';

export type MetodoPago = 'YAPE' | 'PLIN' | 'VISA' | 'MASTERCARD';

export type EstadoPago =
  'PROCESANDO' | 'COMPLETADO' | 'REEMBOLSO_PENDIENTE' | 'REEMBOLSADO' | 'CANCELADO';

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

  fechaSolicitudReembolso?: string;

  fechaLimiteReembolso?: string;

  fechaReembolso?: string;
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

      if (!Array.isArray(pagos)) {
        return [];
      }

      return pagos;
    } catch (error) {
      console.error('Error cargando pagos:', error);

      return [];
    }
  }

  // ============================================================
  // GUARDAR LISTA
  // ============================================================

  private guardar(pagos: Pago[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pagos));

    window.dispatchEvent(new Event('depaya-pagos-actualizados'));
  }

  // ============================================================
  // OBTENER POR ID
  // ============================================================

  obtenerPorId(id: number): Pago | undefined {
    return this.listar().find((pago) => Number(pago.id) === Number(id));
  }

  // ============================================================
  // OBTENER POR RESERVA
  // ============================================================

  obtenerPorReserva(reservaId: number): Pago | undefined {
    return this.listar().find((pago) => Number(pago.reservaId) === Number(reservaId));
  }

  // ============================================================
  // CREAR PAGO PENDIENTE
  // ============================================================

  crearPagoPendiente(reserva: any, metodo: MetodoPago): Pago {
    const pagos = this.listar();

    const existente = pagos.find((pago) => Number(pago.reservaId) === Number(reserva.id));

    if (existente) {
      return {
        ...existente,
      };
    }

    const nuevoId = pagos.length > 0 ? Math.max(...pagos.map((pago) => Number(pago.id))) + 1 : 1;

    const pago: Pago = {
      id: nuevoId,

      reservaId: Number(reserva.id),

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

    const indice = pagos.findIndex((pago) => Number(pago.id) === Number(id));

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
  // SOLICITAR REEMBOLSO
  // ============================================================

  solicitarReembolso(reservaId: number): Pago | null {
    const pagos = this.listar();

    const indice = pagos.findIndex((pago) => Number(pago.reservaId) === Number(reservaId));

    if (indice === -1) {
      return null;
    }

    if (pagos[indice].estado !== 'COMPLETADO') {
      return null;
    }

    const ahora = new Date();

    const limite = new Date(ahora.getTime() + 48 * 60 * 60 * 1000);

    pagos[indice] = {
      ...pagos[indice],

      estado: 'REEMBOLSO_PENDIENTE',

      fechaSolicitudReembolso: ahora.toISOString(),

      fechaLimiteReembolso: limite.toISOString(),

      fechaReembolso: undefined,
    };

    this.guardar(pagos);

    return {
      ...pagos[indice],
    };
  }

  // ============================================================
  // REVERTIR SOLICITUD DE REEMBOLSO
  // ============================================================

  revertirSolicitudReembolso(pagoId: number): boolean {
    const pagos = this.listar();

    const indice = pagos.findIndex((pago) => Number(pago.id) === Number(pagoId));

    if (indice === -1) {
      return false;
    }

    if (pagos[indice].estado !== 'REEMBOLSO_PENDIENTE') {
      return false;
    }

    pagos[indice] = {
      ...pagos[indice],

      estado: 'COMPLETADO',

      fechaSolicitudReembolso: undefined,

      fechaLimiteReembolso: undefined,

      fechaReembolso: undefined,
    };

    this.guardar(pagos);

    return true;
  }

  // ============================================================
  // ADMIN CONFIRMA EL REEMBOLSO
  // ============================================================

  confirmarReembolso(pagoId: number): Pago | null {
    const pagos = this.listar();

    const indice = pagos.findIndex((pago) => Number(pago.id) === Number(pagoId));

    if (indice === -1) {
      return null;
    }

    if (pagos[indice].estado !== 'REEMBOLSO_PENDIENTE') {
      return null;
    }

    pagos[indice] = {
      ...pagos[indice],

      estado: 'REEMBOLSADO',

      fechaReembolso: new Date().toISOString(),
    };

    this.guardar(pagos);

    return {
      ...pagos[indice],
    };
  }

  // ============================================================
  // PROCESAR REEMBOLSOS QUE SUPERARON 48 HORAS
  // ============================================================

  procesarReembolsosVencidos(): Pago[] {
    const pagos = this.listar();

    const ahora = Date.now();

    const reembolsados: Pago[] = [];

    let huboCambios = false;

    for (let i = 0; i < pagos.length; i++) {
      const pago = pagos[i];

      if (pago.estado !== 'REEMBOLSO_PENDIENTE') {
        continue;
      }

      if (!pago.fechaLimiteReembolso) {
        continue;
      }

      const fechaLimite = new Date(pago.fechaLimiteReembolso).getTime();

      if (Number.isNaN(fechaLimite)) {
        continue;
      }

      if (ahora < fechaLimite) {
        continue;
      }

      pagos[i] = {
        ...pago,

        estado: 'REEMBOLSADO',

        fechaReembolso: new Date().toISOString(),
      };

      reembolsados.push({
        ...pagos[i],
      });

      huboCambios = true;
    }

    if (huboCambios) {
      this.guardar(pagos);
    }

    return reembolsados;
  }

  // ============================================================
  // ACTUALIZAR PAGO
  // ============================================================

  actualizarPago(pago: Pago): boolean {
    const pagos = this.listar();

    const indice = pagos.findIndex((item) => Number(item.id) === Number(pago.id));

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
  // ELIMINAR PAGO
  // ============================================================

  eliminarPago(id: number): boolean {
    const pagos = this.listar();

    const nuevos = pagos.filter((pago) => Number(pago.id) !== Number(id));

    if (nuevos.length === pagos.length) {
      return false;
    }

    this.guardar(nuevos);

    return true;
  }

  // ============================================================
  // PAGOS DEL PROPIETARIO
  // ============================================================

  buscarPorPropietario(email: string): Pago[] {
    const correo = email.trim().toLowerCase();

    return this.listar().filter((pago) => pago.propietarioEmail.trim().toLowerCase() === correo);
  }

  // ============================================================
  // PAGOS DEL INQUILINO
  // ============================================================

  buscarPorInquilino(email: string): Pago[] {
    const correo = email.trim().toLowerCase();

    return this.listar().filter((pago) => pago.inquilinoEmail.trim().toLowerCase() === correo);
  }

  // ============================================================
  // INGRESOS DEL PROPIETARIO
  // ============================================================

  obtenerIngresosPropietario(email: string): number {
    /*
      SOLO LOS PAGOS COMPLETADOS
      CUENTAN COMO INGRESO.

      REEMBOLSO_PENDIENTE:
      deja de contar inmediatamente.

      REEMBOLSADO:
      tampoco cuenta.
    */

    return this.buscarPorPropietario(email)
      .filter((pago) => pago.estado === 'COMPLETADO')
      .reduce(
        (total, pago) => total + Number(pago.monto),

        0,
      );
  }

  // ============================================================
  // NOMBRE MÉTODO
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

  // ============================================================
  // NOMBRE DEL ESTADO
  // ============================================================

  obtenerNombreEstado(estado: EstadoPago): string {
    switch (estado) {
      case 'PROCESANDO':
        return 'Procesando';

      case 'COMPLETADO':
        return 'Completado';

      case 'REEMBOLSO_PENDIENTE':
        return 'Reembolso pendiente';

      case 'REEMBOLSADO':
        return 'Devuelto completo';

      case 'CANCELADO':
        return 'Cancelado';

      default:
        return estado;
    }
  }
}
