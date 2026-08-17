import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ActivatedRoute } from '@angular/router';

import { Reserva, ReservaService } from '../../services/reserva.service';

import { DepartamentoService } from '../../services/departamento.service';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mis-alquileres',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './mis-alquileres.component.html',

  styleUrls: ['./mis-alquileres.component.css'],
})
export class MisAlquileresComponent implements OnInit {
  alquileres: Reserva[] = [];

  todosLosAlquileres: Reserva[] = [];

  propietarioEmail = '';

  busquedaActual = '';

  imagenesDepartamentos = new Map<number, string>();

  constructor(
    private reservaService: ReservaService,

    private departamentoService: DepartamentoService,

    private authService: AuthService,

    private activatedRoute: ActivatedRoute,
  ) {}

  // ============================================================
  // INICIO
  // ============================================================

  ngOnInit(): void {
    this.cargarAlquileres();

    this.activatedRoute.queryParamMap.subscribe((parametros) => {
      const busqueda = parametros.get('buscar') || '';

      this.busquedaActual = busqueda;

      this.filtrar(busqueda);
    });
  }

  // ============================================================
  // CARGAR
  // ============================================================

  cargarAlquileres(): void {
    const usuario = this.authService.obtenerUsuarioActual();

    if (!usuario || usuario.rol !== 'PROPIETARIO') {
      this.todosLosAlquileres = [];

      this.alquileres = [];

      this.imagenesDepartamentos.clear();

      return;
    }

    this.propietarioEmail = usuario.email.trim().toLowerCase();

    // ==========================================================
    // DEPARTAMENTOS QUE PERTENECEN AL PROPIETARIO
    // ==========================================================

    const departamentosPropios = this.departamentoService.getDepartamentosPorPropietario(
      this.propietarioEmail,
    );

    const idsPropios = new Set<number>(departamentosPropios.map((departamento) => departamento.id));

    this.imagenesDepartamentos.clear();

    departamentosPropios.forEach((departamento) => {
      if (departamento.URL_Imagen) {
        this.imagenesDepartamentos.set(Number(departamento.id), departamento.URL_Imagen);
      }
    });

    // ==========================================================
    // RESERVAS DEL PROPIETARIO
    // ==========================================================

    this.todosLosAlquileres = this.reservaService
      .buscarPorPropietario(this.propietarioEmail)
      .filter((reserva) => idsPropios.has(Number(reserva.departamentoId)))
      .sort((a, b) => new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime());

    this.alquileres = [...this.todosLosAlquileres];
  }

  // ============================================================
  // BUSCAR HUÉSPED
  // ============================================================

  filtrar(texto: string): void {
    const busqueda = texto.trim().toLowerCase();

    if (!busqueda) {
      this.alquileres = [...this.todosLosAlquileres];

      return;
    }

    this.alquileres = this.todosLosAlquileres.filter((reserva) => {
      const nombre = (reserva.inquilinoNombre || '').toLowerCase();

      const email = (reserva.inquilinoEmail || '').toLowerCase();

      const departamento = (reserva.departamento || '').toLowerCase();

      const ciudad = (reserva.ciudad || '').toLowerCase();

      return (
        nombre.includes(busqueda) ||
        email.includes(busqueda) ||
        departamento.includes(busqueda) ||
        ciudad.includes(busqueda)
      );
    });
  }

  // ============================================================
  // RESUMEN
  // ============================================================

  get totalReservas(): number {
    return this.todosLosAlquileres.length;
  }

  get totalConfirmadas(): number {
    return this.todosLosAlquileres.filter((reserva) => reserva.estado === 'CONFIRMADA').length;
  }

  get totalPendientes(): number {
    return this.todosLosAlquileres.filter((reserva) => reserva.estado === 'PENDIENTE').length;
  }

  get huespedesProximos(): number {
    const hoy = this.obtenerFechaHoy();

    return this.todosLosAlquileres
      .filter(
        (reserva) =>
          (reserva.estado === 'CONFIRMADA' || reserva.estado === 'PENDIENTE') &&
          reserva.fechaFin >= hoy,
      )
      .reduce((total, reserva) => total + this.obtenerCantidadHuespedes(reserva), 0);
  }

  // ============================================================
  // FECHA ACTUAL YYYY-MM-DD
  // ============================================================

  private obtenerFechaHoy(): string {
    const ahora = new Date();

    const anio = ahora.getFullYear();

    const mes = String(ahora.getMonth() + 1).padStart(2, '0');

    const dia = String(ahora.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  // ============================================================
  // IMAGEN DEL DEPARTAMENTO
  // ============================================================

  obtenerImagen(alquiler: Reserva): string {
    return this.imagenesDepartamentos.get(Number(alquiler.departamentoId)) || '';
  }

  // ============================================================
  // HUÉSPEDES
  // ============================================================

  tieneHuespedesRegistrados(alquiler: Reserva): boolean {
    return Number.isFinite(Number(alquiler.huespedes))
      && Number(alquiler.huespedes) >= 1;
  }

  obtenerCantidadHuespedes(alquiler: Reserva): number {
    if (!this.tieneHuespedesRegistrados(alquiler)) {
      return 0;
    }

    return Math.floor(Number(alquiler.huespedes));
  }

  textoHuespedes(alquiler: Reserva): string {
    const cantidad = this.obtenerCantidadHuespedes(alquiler);

    if (cantidad <= 0) {
      return 'No registrado';
    }

    return cantidad === 1 ? '1 huésped' : `${cantidad} huéspedes`;
  }

  // ============================================================
  // CLASE ESTADO
  // ============================================================

  claseEstado(estado: string): string {
    if (estado === 'CONFIRMADA') {
      return 'confirmada';
    }

    if (estado === 'PENDIENTE') {
      return 'pendiente';
    }

    return 'cancelada';
  }
}
