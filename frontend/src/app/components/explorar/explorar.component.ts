import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Departamento, DepartamentoService } from '../../services/departamento.service';
import { AuthService } from '../../services/auth.service';
import { DepartamentoCardComponent } from '../departamento-card/departamento-card.component';

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [CommonModule, FormsModule, DepartamentoCardComponent],
  templateUrl: './explorar.component.html',
  styleUrls: ['./explorar.component.css'],
})
export class ExplorarComponent implements OnInit {
  // ==========================================
  // DEPARTAMENTOS
  // ==========================================

  listaDepartamentos: Departamento[] = [];
  departamentosFiltrados: Departamento[] = [];

  // ==========================================
  // BUSCADOR / FILTROS
  // ==========================================

  busqueda = '';
  ciudadSeleccionada = '';
  categoriaSeleccionada = '';
  huespedes: number | null = 1;

  // ==========================================
  // CATEGORÍAS
  // ==========================================

  categorias: string[] = ['Playa', 'Moderno', 'Vista al mar', 'Loft', 'Ejecutivo', 'Familiar'];

  // ==========================================
  // DISTRITOS
  // ==========================================

  ciudades: string[] = [];

  // ==========================================
  // USUARIO
  // ==========================================

  usuarioActual: any = null;

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private departamentoService: DepartamentoService,
    private authService: AuthService,
    private router: Router,
  ) {}

  // ==========================================
  // INICIO
  // ==========================================

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActual();
    this.cargarDepartamentos();
  }

  // ==========================================
  // CARGAR DEPARTAMENTOS
  // ==========================================

  cargarDepartamentos(): void {
    this.listaDepartamentos = this.departamentoService.getDepartamentos();
    this.departamentosFiltrados = [...this.listaDepartamentos];
    this.cargarCiudades();
  }

  // ==========================================
  // CARGAR DISTRITOS
  // ==========================================

  cargarCiudades(): void {
    const distritos = this.listaDepartamentos
      .map((departamento) => departamento.Distrito)
      .filter((distrito) => distrito && distrito.trim() !== '');

    this.ciudades = [...new Set(distritos)].sort();
  }

  // ==========================================
  // BUSCAR
  // ==========================================

  buscar(): void {
    const texto = this.busqueda.trim().toLowerCase();
    const ciudad = this.ciudadSeleccionada.trim().toLowerCase();
    const categoria = this.categoriaSeleccionada.trim().toLowerCase();

    this.departamentosFiltrados = this.listaDepartamentos.filter((departamento) => {
      const titulo = (departamento.Titulo || '').toLowerCase();
      const distrito = (departamento.Distrito || '').toLowerCase();
      const categoriaDepartamento = (departamento.Categoria || '').toLowerCase();
      const descripcion = (departamento.Descripcion || '').toLowerCase();

      const coincideBusqueda =
        texto === '' ||
        titulo.includes(texto) ||
        distrito.includes(texto) ||
        categoriaDepartamento.includes(texto) ||
        descripcion.includes(texto);

      const coincideCiudad = ciudad === '' || distrito === ciudad;
      const coincideCategoria = categoria === '' || categoriaDepartamento === categoria;

      return coincideBusqueda && coincideCiudad && coincideCategoria;
    });
  }

  // ==========================================
  // SELECCIONAR CATEGORÍA
  // ==========================================

  seleccionarCategoria(categoria: string): void {
    this.categoriaSeleccionada = this.categoriaSeleccionada === categoria ? '' : categoria;

    this.buscar();
  }

  // ==========================================
  // SELECCIONAR DISTRITO
  // ==========================================

  seleccionarCiudad(ciudad: string): void {
    this.ciudadSeleccionada = ciudad;
    this.buscar();
  }

  // ==========================================
  // HUÉSPEDES
  // ==========================================

  normalizarHuespedes(): void {
    if (this.huespedes === null) {
      return;
    }

    const cantidad = Number(this.huespedes);

    if (!Number.isFinite(cantidad)) {
      this.huespedes = 1;
      return;
    }

    if (cantidad < 1) {
      this.huespedes = 1;
      return;
    }

    this.huespedes = Math.floor(cantidad);
  }

  obtenerCapacidad(departamento: Departamento): number {
    return Number(departamento.Capacidad ?? 0);
  }

  capacidadSuperada(departamento: Departamento): boolean {
    const capacidad = this.obtenerCapacidad(departamento);
    const cantidad = Number(this.huespedes ?? 0);

    return capacidad > 0 && cantidad > capacidad;
  }

  obtenerMensajeCapacidad(departamento: Departamento): string {
    const capacidad = this.obtenerCapacidad(departamento);

    return `Este departamento admite un máximo de ${capacidad} huésped(es). Reduce la cantidad para continuar.`;
  }

  // ==========================================
  // LIMPIAR FILTROS
  // ==========================================

  limpiarFiltros(): void {
    this.busqueda = '';
    this.ciudadSeleccionada = '';
    this.categoriaSeleccionada = '';
    this.huespedes = 1;
    this.departamentosFiltrados = [...this.listaDepartamentos];
  }

  // ==========================================
  // RESERVAR
  // ==========================================

  reservar(departamento: Departamento): void {
    this.normalizarHuespedes();

    const cantidadHuespedes = Number(this.huespedes ?? 0);

    if (cantidadHuespedes < 1) {
      return;
    }

    if (this.capacidadSuperada(departamento)) {
      return;
    }

    const usuario = this.authService.obtenerUsuarioActual();

    if (!usuario) {
      alert('Debes iniciar sesión para reservar.');
      this.router.navigate(['/login']);
      return;
    }

    if (usuario.rol !== 'INQUILINO') {
      alert('Solo los inquilinos pueden realizar reservas.');
      return;
    }

    localStorage.setItem('departamentoSeleccionado', JSON.stringify(departamento));
    localStorage.setItem('huespedesSeleccionados', String(cantidadHuespedes));

    this.router.navigate(['/reservar']);
  }

  // ==========================================
  // VER DETALLE
  // ==========================================

  verDetalle(departamento: Departamento): void {
    localStorage.setItem('departamentoSeleccionado', JSON.stringify(departamento));

    if (Number(this.huespedes ?? 0) >= 1) {
      localStorage.setItem('huespedesSeleccionados', String(Number(this.huespedes)));
    }

    this.router.navigate(['/detalle']);
  }

  // ==========================================
  // HELPERS
  // ==========================================

  obtenerNombre(departamento: Departamento): string {
    return departamento.Titulo;
  }

  obtenerImagen(departamento: Departamento): string {
    return departamento.URL_Imagen;
  }

  obtenerPrecio(departamento: Departamento): number {
    return departamento.Precio_Noche;
  }
}
