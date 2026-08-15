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

    // ==========================================================
    // RESERVAS DEL PROPIETARIO
    // ==========================================================

    this.todosLosAlquileres = this.reservaService
      .buscarPorPropietario(this.propietarioEmail)
      .filter((reserva) => idsPropios.has(reserva.departamentoId))
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
