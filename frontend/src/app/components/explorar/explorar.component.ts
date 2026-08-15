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
  // BUSCADOR
  // ==========================================

  busqueda = '';

  ciudadSeleccionada = '';

  categoriaSeleccionada = '';

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

      const coincideBusqueda =
        texto === '' ||
        titulo.includes(texto) ||
        distrito.includes(texto) ||
        categoriaDepartamento.includes(texto);

      const coincideCiudad = ciudad === '' || distrito === ciudad;

      const coincideCategoria = categoria === '' || categoriaDepartamento === categoria;

      return coincideBusqueda && coincideCiudad && coincideCategoria;
    });
  }

  // ==========================================
  // SELECCIONAR CATEGORÍA
  // ==========================================

  seleccionarCategoria(categoria: string): void {
    if (this.categoriaSeleccionada === categoria) {
      this.categoriaSeleccionada = '';
    } else {
      this.categoriaSeleccionada = categoria;
    }

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
  // LIMPIAR FILTROS
  // ==========================================

  limpiarFiltros(): void {
    this.busqueda = '';

    this.ciudadSeleccionada = '';

    this.categoriaSeleccionada = '';

    this.departamentosFiltrados = [...this.listaDepartamentos];
  }

  // ==========================================
  // RESERVAR
  // ==========================================

  reservar(departamento: Departamento): void {
    // Verificar usuario
    const usuario = this.authService.obtenerUsuarioActual();

    // No está logueado
    if (!usuario) {
      alert('Debes iniciar sesión para reservar.');

      this.router.navigate(['/login']);

      return;
    }

    // Verificar que sea INQUILINO
    if (usuario.rol !== 'INQUILINO') {
      alert('Solo los inquilinos pueden realizar reservas.');

      return;
    }

    // Guardar departamento seleccionado
    localStorage.setItem('departamentoSeleccionado', JSON.stringify(departamento));

    // Ir al formulario de reserva
    this.router.navigate(['/reservar']);
  }

  // ==========================================
  // VER DETALLE
  // ==========================================

  verDetalle(departamento: Departamento): void {
    localStorage.setItem('departamentoSeleccionado', JSON.stringify(departamento));

    this.router.navigate(['/detalle']);
  }

  // ==========================================
  // OBTENER NOMBRE
  // ==========================================

  obtenerNombre(departamento: Departamento): string {
    return departamento.Titulo;
  }

  // ==========================================
  // OBTENER IMAGEN
  // ==========================================

  obtenerImagen(departamento: Departamento): string {
    return departamento.URL_Imagen;
  }

  // ==========================================
  // OBTENER PRECIO
  // ==========================================

  obtenerPrecio(departamento: Departamento): number {
    return departamento.Precio_Noche;
  }
}
