import { Injectable } from '@angular/core';

export interface Departamento {
  id: number;

  Titulo: string;

  Distrito: string;

  Precio_Noche: number;

  Habitaciones: number;

  Banos: number;

  Categoria: string;

  URL_Imagen: string;

  propietarioEmail: string;

  Descripcion?: string;

  Capacidad?: number;

  fechaPublicacion?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DepartamentoService {
  private readonly STORAGE_KEY = 'departamentosDepaYa';

  private departamentos: Departamento[] = [];

  constructor() {
    this.cargarDepartamentos();
  }

  // ============================================================
  // CARGAR
  // ============================================================

  private cargarDepartamentos(): void {
    const datos = localStorage.getItem(this.STORAGE_KEY);

    if (datos) {
      try {
        const lista = JSON.parse(datos);

        if (Array.isArray(lista)) {
          this.departamentos = lista;

          return;
        }
      } catch (error) {
        console.error('Error al cargar departamentos:', error);
      }
    }

    // ==========================================================
    // DATOS INICIALES
    // ==========================================================

    this.departamentos = [
      {
        id: 1,

        Titulo: 'Loft Ejecutivo Prime con Vista al Mar',

        Distrito: 'Miraflores',

        Precio_Noche: 280,

        Habitaciones: 2,

        Banos: 2,

        Categoria: 'Loft',

        URL_Imagen:
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',

        propietarioEmail: 'propietario@depaya.com',

        Descripcion: 'Loft moderno y cómodo en Miraflores.',

        Capacidad: 4,
      },

      {
        id: 2,

        Titulo: 'Departamento Moderno en San Isidro',

        Distrito: 'San Isidro',

        Precio_Noche: 320,

        Habitaciones: 3,

        Banos: 2,

        Categoria: 'Moderno',

        URL_Imagen:
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80',

        propietarioEmail: 'propietario@depaya.com',

        Descripcion: 'Departamento moderno en excelente ubicación.',

        Capacidad: 5,
      },

      {
        id: 3,

        Titulo: 'Departamento Familiar en Barranco',

        Distrito: 'Barranco',

        Precio_Noche: 250,

        Habitaciones: 3,

        Banos: 2,

        Categoria: 'Familiar',

        URL_Imagen:
          'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80',

        propietarioEmail: 'propietario@depaya.com',

        Descripcion: 'Departamento familiar cerca de los principales atractivos de Barranco.',

        Capacidad: 6,
      },

      {
        id: 4,

        Titulo: 'Departamento con Vista al Mar',

        Distrito: 'San Miguel',

        Precio_Noche: 290,

        Habitaciones: 2,

        Banos: 2,

        Categoria: 'Vista al mar',

        URL_Imagen:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',

        propietarioEmail: 'propietario@depaya.com',

        Descripcion: 'Departamento con una excelente vista al mar.',

        Capacidad: 4,
      },

      {
        id: 5,

        Titulo: 'Loft Ejecutivo Moderno',

        Distrito: 'Surco',

        Precio_Noche: 300,

        Habitaciones: 2,

        Banos: 2,

        Categoria: 'Ejecutivo',

        URL_Imagen:
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',

        propietarioEmail: 'propietario@depaya.com',

        Descripcion: 'Loft ejecutivo moderno y completamente equipado.',

        Capacidad: 4,
      },

      {
        id: 6,

        Titulo: 'Casa de Playa Familiar',

        Distrito: 'Chorrillos',

        Precio_Noche: 350,

        Habitaciones: 4,

        Banos: 3,

        Categoria: 'Playa',

        URL_Imagen:
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',

        propietarioEmail: 'propietario@depaya.com',

        Descripcion: 'Amplio alojamiento familiar cerca del mar.',

        Capacidad: 8,
      },
    ];

    this.guardar();
  }

  // ============================================================
  // SINCRONIZAR DESDE LOCALSTORAGE
  // ============================================================

  private sincronizar(): void {
    const datos = localStorage.getItem(this.STORAGE_KEY);

    if (!datos) {
      return;
    }

    try {
      const lista = JSON.parse(datos);

      if (Array.isArray(lista)) {
        this.departamentos = lista;
      }
    } catch (error) {
      console.error('Error sincronizando departamentos:', error);
    }
  }

  // ============================================================
  // GUARDAR
  // ============================================================

  private guardar(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.departamentos));
  }

  // ============================================================
  // LISTAR TODOS
  // ============================================================

  getDepartamentos(): Departamento[] {
    this.sincronizar();

    return this.departamentos.map((departamento) => ({
      ...departamento,
    }));
  }

  // ============================================================
  // BUSCAR POR ID
  // ============================================================

  getDepartamentoById(id: number): Departamento | undefined {
    this.sincronizar();

    const departamento = this.departamentos.find((item) => item.id === id);

    return departamento ? { ...departamento } : undefined;
  }

  // ============================================================
  // DEPARTAMENTOS DEL PROPIETARIO
  // ============================================================

  getDepartamentosPorPropietario(email: string): Departamento[] {
    this.sincronizar();

    const correo = email.trim().toLowerCase();

    return this.departamentos
      .filter((departamento) => departamento.propietarioEmail.trim().toLowerCase() === correo)
      .map((departamento) => ({
        ...departamento,
      }));
  }

  // ============================================================
  // AGREGAR
  // ============================================================

  agregarDepartamento(departamento: Departamento): Departamento {
    this.sincronizar();

    const nuevoId =
      this.departamentos.length > 0
        ? Math.max(...this.departamentos.map((item) => item.id)) + 1
        : 1;

    const nuevoDepartamento: Departamento = {
      ...departamento,

      id: nuevoId,

      propietarioEmail: departamento.propietarioEmail.trim().toLowerCase(),

      fechaPublicacion: departamento.fechaPublicacion || new Date().toISOString(),
    };

    this.departamentos.push(nuevoDepartamento);

    this.guardar();

    return {
      ...nuevoDepartamento,
    };
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  actualizarDepartamento(departamento: Departamento): boolean {
    this.sincronizar();

    const indice = this.departamentos.findIndex((item) => item.id === departamento.id);

    if (indice === -1) {
      return false;
    }

    this.departamentos[indice] = {
      ...this.departamentos[indice],

      ...departamento,
    };

    this.guardar();

    return true;
  }

  // ============================================================
  // ELIMINAR
  // ============================================================

  eliminarDepartamento(id: number): boolean {
    this.sincronizar();

    const cantidadAnterior = this.departamentos.length;

    this.departamentos = this.departamentos.filter((departamento) => departamento.id !== id);

    if (this.departamentos.length === cantidadAnterior) {
      return false;
    }

    this.guardar();

    return true;
  }
}
