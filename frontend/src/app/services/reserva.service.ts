import { Injectable } from '@angular/core';

export interface Reserva {
  id: number;

  departamentoId: number;

  departamento: string;

  ciudad: string;

  propietarioEmail: string;

  inquilinoEmail: string;

  inquilinoNombre: string;

  fechaInicio: string;

  fechaFin: string;

  noches: number;

  precioNoche: number;

  total: number;

  estado: 'CONFIRMADA' | 'PENDIENTE' | 'CANCELADA';

  fechaReserva: string;
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
    const datos = localStorage.getItem(this.STORAGE_KEY);

    if (!datos) {
      return [];
    }

    try {
      const reservas: Reserva[] = JSON.parse(datos);

      return Array.isArray(reservas) ? reservas : [];
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
  // CREAR RESERVA
  // ============================================================

  guardar(reserva: Reserva): Reserva {
    const reservas = this.listar();

    const nuevoId = reservas.length > 0 ? Math.max(...reservas.map((item) => item.id)) + 1 : 1;

    const nuevaReserva: Reserva = {
      ...reserva,

      id: nuevoId,
    };

    reservas.push(nuevaReserva);

    this.guardarLista(reservas);

    return {
      ...nuevaReserva,
    };
  }

  // ============================================================
  // CAMBIAR ESTADO
  // ============================================================

  actualizarEstado(id: number, estado: 'CONFIRMADA' | 'PENDIENTE' | 'CANCELADA'): boolean {
    const reservas = this.listar();

    const indice = reservas.findIndex((reserva) => reserva.id === id);

    if (indice === -1) {
      return false;
    }

    reservas[indice] = {
      ...reservas[indice],

      estado,
    };

    this.guardarLista(reservas);

    return true;
  }

  // ============================================================
  // INQUILINO
  // ============================================================

  buscarPorInquilino(email: string): Reserva[] {
    const correo = email.trim().toLowerCase();

    return this.listar().filter(
      (reserva) => reserva.inquilinoEmail.trim().toLowerCase() === correo,
    );
  }

  // ============================================================
  // PROPIETARIO
  // ============================================================

  buscarPorPropietario(email: string): Reserva[] {
    const correo = email.trim().toLowerCase();

    return this.listar().filter(
      (reserva) => reserva.propietarioEmail.trim().toLowerCase() === correo,
    );
  }

  // ============================================================
  // TOTAL
  // ============================================================

  obtenerTotalPropietario(email: string): number {
    return this.buscarPorPropietario(email)
      .filter((reserva) => reserva.estado === 'CONFIRMADA')
      .reduce(
        (total, reserva) => total + Number(reserva.total),

        0,
      );
  }
}
