import { Injectable } from '@angular/core';

export type EstadoReserva = 'CONFIRMADA' | 'PENDIENTE' | 'CANCELADA';

export type EstadoReembolso = 'NO_APLICA' | 'PENDIENTE' | 'DEVUELTO';

export type MetodoReembolso = 'YAPE' | 'PLIN' | 'VISA' | 'MASTERCARD';

export interface Reserva {
  id: number;

  departamentoId: number;

  departamento: string;

  ciudad: string;

  propietarioEmail: string;

  inquilinoEmail: string;

  inquilinoNombre: string;

  // Cantidad de huéspedes de la reserva.
  // Es opcional para mantener compatibilidad con reservas antiguas.
  huespedes?: number;

  fechaInicio: string;

  fechaFin: string;

  noches: number;

  precioNoche: number;

  total: number;

  estado: EstadoReserva;

  fechaReserva: string;

  // REEMBOLSO
  estadoReembolso?: EstadoReembolso;

  metodoReembolso?: MetodoReembolso;

  fechaCancelacion?: string;

  fechaSolicitudReembolso?: string;

  fechaLimiteReembolso?: string;

  fechaReembolso?: string;
}

export interface RangoOcupado {
  fechaInicio: string;

  fechaFin: string;

  estado: EstadoReserva;

  reservaId: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private readonly STORAGE_KEY = 'reservasDepaYa';

  // ============================================================
  // LISTAR
  // ============================================================

  listar(): Reserva[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    const datos = localStorage.getItem(this.STORAGE_KEY);

    if (!datos) {
      return [];
    }

    try {
      const reservas: Reserva[] = JSON.parse(datos);

      if (!Array.isArray(reservas)) {
        return [];
      }

      return reservas.map((reserva) => ({
        ...reserva,

        estadoReembolso: reserva.estadoReembolso ?? 'NO_APLICA',

        huespedes:
          Number.isFinite(Number(reserva.huespedes)) && Number(reserva.huespedes) >= 1
            ? Math.floor(Number(reserva.huespedes))
            : undefined,
      }));
    } catch (error) {
      console.error('Error cargando reservas:', error);

      return [];
    }
  }

  // ============================================================
  // GUARDAR LISTA
  // ============================================================

  private guardarLista(reservas: Reserva[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reservas));

    window.dispatchEvent(new Event('depaya-reservas-actualizadas'));
  }

  // ============================================================
  // OBTENER POR ID
  // ============================================================

  obtenerPorId(id: number): Reserva | undefined {
    return this.listar().find((reserva) => Number(reserva.id) === Number(id));
  }

  // ============================================================
  // CONVERTIR FECHA A UTC
  // ============================================================

  private convertirFecha(fecha: string): number {
    if (!fecha) {
      return NaN;
    }

    const partes = fecha.split('-');

    if (partes.length !== 3) {
      return NaN;
    }

    const anio = Number(partes[0]);

    const mes = Number(partes[1]);

    const dia = Number(partes[2]);

    if (!anio || !mes || !dia) {
      return NaN;
    }

    return Date.UTC(anio, mes - 1, dia);
  }

  // ============================================================
  // HOY EN UTC USANDO FECHA LOCAL
  // ============================================================

  private obtenerHoyUTC(): number {
    const hoy = new Date();

    return Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  }

  // ============================================================
  // FORMATEAR UTC A YYYY-MM-DD
  // ============================================================

  private timestampAFecha(timestamp: number): string {
    const fecha = new Date(timestamp);

    const anio = fecha.getUTCFullYear();

    const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');

    const dia = String(fecha.getUTCDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  // ============================================================
  // VALIDAR FECHAS
  // ============================================================

  fechasValidas(fechaInicio: string, fechaFin: string): boolean {
    const inicio = this.convertirFecha(fechaInicio);

    const fin = this.convertirFecha(fechaFin);

    if (Number.isNaN(inicio) || Number.isNaN(fin)) {
      return false;
    }

    return fin > inicio;
  }

  // ============================================================
  // CALCULAR NOCHES
  // ============================================================

  calcularNoches(fechaInicio: string, fechaFin: string): number {
    if (!this.fechasValidas(fechaInicio, fechaFin)) {
      return 0;
    }

    const inicio = this.convertirFecha(fechaInicio);

    const fin = this.convertirFecha(fechaFin);

    return Math.floor((fin - inicio) / (1000 * 60 * 60 * 24));
  }

  // ============================================================
  // RESERVAS ACTIVAS DEL DEPARTAMENTO
  // ============================================================

  obtenerReservasActivasDepartamento(departamentoId: number): Reserva[] {
    return this.listar().filter((reserva) => {
      const mismoDepartamento = Number(reserva.departamentoId) === Number(departamentoId);

      const bloquea = reserva.estado === 'CONFIRMADA' || reserva.estado === 'PENDIENTE';

      return mismoDepartamento && bloquea;
    });
  }

  // ============================================================
  // CONFLICTOS
  // ============================================================

  obtenerConflictos(
    departamentoId: number,
    fechaInicio: string,
    fechaFin: string,
    excluirReservaId?: number,
  ): Reserva[] {
    if (!this.fechasValidas(fechaInicio, fechaFin)) {
      return [];
    }

    const nuevaEntrada = this.convertirFecha(fechaInicio);

    const nuevaSalida = this.convertirFecha(fechaFin);

    return this.obtenerReservasActivasDepartamento(departamentoId).filter((reserva) => {
      if (excluirReservaId !== undefined && Number(reserva.id) === Number(excluirReservaId)) {
        return false;
      }

      const entradaExistente = this.convertirFecha(reserva.fechaInicio);

      const salidaExistente = this.convertirFecha(reserva.fechaFin);

      return nuevaEntrada < salidaExistente && nuevaSalida > entradaExistente;
    });
  }

  // ============================================================
  // DISPONIBILIDAD
  // ============================================================

  estaDisponible(
    departamentoId: number,
    fechaInicio: string,
    fechaFin: string,
    excluirReservaId?: number,
  ): boolean {
    if (!this.fechasValidas(fechaInicio, fechaFin)) {
      return false;
    }

    return (
      this.obtenerConflictos(departamentoId, fechaInicio, fechaFin, excluirReservaId).length === 0
    );
  }

  // ============================================================
  // RANGOS OCUPADOS
  // ============================================================

  obtenerRangosOcupados(departamentoId: number): RangoOcupado[] {
    return this.obtenerReservasActivasDepartamento(departamentoId)
      .map((reserva) => ({
        fechaInicio: reserva.fechaInicio,

        fechaFin: reserva.fechaFin,

        estado: reserva.estado,

        reservaId: reserva.id,
      }))
      .sort((a, b) => this.convertirFecha(a.fechaInicio) - this.convertirFecha(b.fechaInicio));
  }

  // ============================================================
  // FECHA OCUPADA
  // ============================================================

  fechaEstaOcupada(departamentoId: number, fecha: string): boolean {
    const fechaSeleccionada = this.convertirFecha(fecha);

    if (Number.isNaN(fechaSeleccionada)) {
      return false;
    }

    return this.obtenerReservasActivasDepartamento(departamentoId).some((reserva) => {
      const inicio = this.convertirFecha(reserva.fechaInicio);

      const fin = this.convertirFecha(reserva.fechaFin);

      return fechaSeleccionada >= inicio && fechaSeleccionada < fin;
    });
  }

  // ============================================================
  // CREAR RESERVA
  // ============================================================

  guardar(reserva: Reserva): Reserva {
    if (!this.fechasValidas(reserva.fechaInicio, reserva.fechaFin)) {
      throw new Error('Las fechas seleccionadas no son válidas.');
    }

    if (!this.estaDisponible(reserva.departamentoId, reserva.fechaInicio, reserva.fechaFin)) {
      throw new Error('Este departamento ya está reservado en las fechas seleccionadas.');
    }

    const reservas = this.listar();

    const nuevoId =
      reservas.length > 0 ? Math.max(...reservas.map((item) => Number(item.id))) + 1 : 1;

    const noches = this.calcularNoches(reserva.fechaInicio, reserva.fechaFin);

    const nuevaReserva: Reserva = {
      ...reserva,

      id: nuevoId,

      noches,

      total: noches * Number(reserva.precioNoche),

      fechaReserva: reserva.fechaReserva || new Date().toISOString(),

      estadoReembolso: 'NO_APLICA',
    };

    reservas.push(nuevaReserva);

    this.guardarLista(reservas);

    return {
      ...nuevaReserva,
    };
  }

  // ============================================================
  // ACTUALIZAR RESERVA
  // ============================================================

  actualizarReserva(reservaActualizada: Reserva): boolean {
    const reservas = this.listar();

    const indice = reservas.findIndex(
      (reserva) => Number(reserva.id) === Number(reservaActualizada.id),
    );

    if (indice === -1) {
      return false;
    }

    if (!this.fechasValidas(reservaActualizada.fechaInicio, reservaActualizada.fechaFin)) {
      return false;
    }

    if (reservaActualizada.estado === 'CONFIRMADA' || reservaActualizada.estado === 'PENDIENTE') {
      const disponible = this.estaDisponible(
        reservaActualizada.departamentoId,

        reservaActualizada.fechaInicio,

        reservaActualizada.fechaFin,

        reservaActualizada.id,
      );

      if (!disponible) {
        return false;
      }
    }

    const noches = this.calcularNoches(reservaActualizada.fechaInicio, reservaActualizada.fechaFin);

    reservas[indice] = {
      ...reservas[indice],

      ...reservaActualizada,

      noches,

      total: noches * Number(reservaActualizada.precioNoche),
    };

    this.guardarLista(reservas);

    return true;
  }

  // ============================================================
  // ACTUALIZAR ESTADO
  // ============================================================

  actualizarEstado(id: number, estado: EstadoReserva): boolean {
    const reservas = this.listar();

    const indice = reservas.findIndex((reserva) => Number(reserva.id) === Number(id));

    if (indice === -1) {
      return false;
    }

    if (estado === 'CONFIRMADA' || estado === 'PENDIENTE') {
      const reserva = reservas[indice];

      const disponible = this.estaDisponible(
        reserva.departamentoId,
        reserva.fechaInicio,
        reserva.fechaFin,
        reserva.id,
      );

      if (!disponible) {
        return false;
      }
    }

    reservas[indice] = {
      ...reservas[indice],

      estado,
    };

    this.guardarLista(reservas);

    return true;
  }

  // ============================================================
  // DÍAS HASTA EL INGRESO
  // ============================================================

  obtenerDiasHastaIngreso(reserva: Reserva): number {
    const ingreso = this.convertirFecha(reserva.fechaInicio);

    if (Number.isNaN(ingreso)) {
      return -1;
    }

    const hoy = this.obtenerHoyUTC();

    return Math.floor((ingreso - hoy) / (1000 * 60 * 60 * 24));
  }

  // ============================================================
  // PUEDE CANCELAR CON REEMBOLSO
  // ============================================================

  puedeCancelarConReembolso(reserva: Reserva): boolean {
    if (reserva.estado !== 'CONFIRMADA') {
      return false;
    }

    /*
      1 o más:
      todavía falta al menos un día.

      0:
      es el mismo día del ingreso.

      negativo:
      ya comenzó o pasó.
    */

    return this.obtenerDiasHastaIngreso(reserva) >= 1;
  }

  // ============================================================
  // ÚLTIMO DÍA DE CANCELACIÓN GRATUITA
  // ============================================================

  obtenerFechaLimiteCancelacion(reserva: Reserva): string {
    const ingreso = this.convertirFecha(reserva.fechaInicio);

    if (Number.isNaN(ingreso)) {
      return '';
    }

    const unDia = 24 * 60 * 60 * 1000;

    return this.timestampAFecha(ingreso - unDia);
  }

  // ============================================================
  // CANCELAR SIN REEMBOLSO
  // ============================================================

  cancelarReserva(id: number): boolean {
    const reservas = this.listar();

    const indice = reservas.findIndex((reserva) => Number(reserva.id) === Number(id));

    if (indice === -1) {
      return false;
    }

    reservas[indice] = {
      ...reservas[indice],

      estado: 'CANCELADA',

      estadoReembolso: 'NO_APLICA',

      fechaCancelacion: new Date().toISOString(),
    };

    this.guardarLista(reservas);

    return true;
  }

  // ============================================================
  // CANCELAR CON REEMBOLSO
  // ============================================================

  cancelarConReembolso(
    id: number,
    metodo: MetodoReembolso,
    fechaSolicitud: string,
    fechaLimite: string,
  ): boolean {
    const reservas = this.listar();

    const indice = reservas.findIndex((reserva) => Number(reserva.id) === Number(id));

    if (indice === -1) {
      return false;
    }

    const reserva = reservas[indice];

    if (!this.puedeCancelarConReembolso(reserva)) {
      return false;
    }

    const ahora = new Date().toISOString();

    reservas[indice] = {
      ...reserva,

      estado: 'CANCELADA',

      estadoReembolso: 'PENDIENTE',

      metodoReembolso: metodo,

      fechaCancelacion: ahora,

      fechaSolicitudReembolso: fechaSolicitud,

      fechaLimiteReembolso: fechaLimite,

      fechaReembolso: undefined,
    };

    this.guardarLista(reservas);

    return true;
  }

  // ============================================================
  // MARCAR REEMBOLSO COMO DEVUELTO
  // ============================================================

  marcarReembolsoDevuelto(
    reservaId: number,
    metodo?: MetodoReembolso,
    fechaReembolso?: string,
  ): boolean {
    const reservas = this.listar();

    const indice = reservas.findIndex((reserva) => Number(reserva.id) === Number(reservaId));

    if (indice === -1) {
      return false;
    }

    reservas[indice] = {
      ...reservas[indice],

      estado: 'CANCELADA',

      estadoReembolso: 'DEVUELTO',

      metodoReembolso: metodo ?? reservas[indice].metodoReembolso,

      fechaReembolso: fechaReembolso ?? new Date().toISOString(),
    };

    this.guardarLista(reservas);

    return true;
  }

  // ============================================================
  // INQUILINO
  // ============================================================

  buscarPorInquilino(email: string): Reserva[] {
    const correo = email.trim().toLowerCase();

    return this.listar()
      .filter((reserva) => reserva.inquilinoEmail.trim().toLowerCase() === correo)
      .sort((a, b) => new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime());
  }

  // ============================================================
  // PROPIETARIO
  // ============================================================

  buscarPorPropietario(email: string): Reserva[] {
    const correo = email.trim().toLowerCase();

    return this.listar()
      .filter((reserva) => reserva.propietarioEmail.trim().toLowerCase() === correo)
      .sort((a, b) => new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime());
  }

  // ============================================================
  // TOTAL PROPIETARIO
  // ============================================================

  obtenerTotalPropietario(email: string): number {
    return this.buscarPorPropietario(email)
      .filter((reserva) => reserva.estado === 'CONFIRMADA')
      .reduce((total, reserva) => total + Number(reserva.total), 0);
  }

  // ============================================================
  // CANTIDAD CONFIRMADAS PROPIETARIO
  // ============================================================

  obtenerCantidadReservasPropietario(email: string): number {
    return this.buscarPorPropietario(email).filter((reserva) => reserva.estado === 'CONFIRMADA')
      .length;
  }
}
