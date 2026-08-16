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
  TienePiscina?: boolean;
  TieneWifi?: boolean;
  AdmiteMascotas?: boolean;
  fechaPublicacion?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DepartamentoService {
  private readonly STORAGE_KEY = 'departamentosDepaYa';

  private readonly TITULOS_DEMO = new Set([
    'Loft Ejecutivo Prime con Vista al Mar',
    'Departamento Moderno en San Isidro',
    'Departamento Familiar en Barranco',
    'Departamento con Vista al Mar',
    'Loft Ejecutivo Moderno',
    'Casa de Playa Familiar',
  ]);

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
          this.departamentos = this.limpiarDepartamentosDemo(lista);
          this.normalizarDepartamentos();
          this.guardar();
          return;
        }
      } catch (error) {
        console.error('Error al cargar departamentos:', error);
      }
    }

    // Desde ahora el proyecto inicia sin propiedades de relleno.
    // Solo se mostrarán las publicaciones creadas por propietarios.
    this.departamentos = [];
    this.guardar();
  }

  // ============================================================
  // QUITAR LOS 6 DEPARTAMENTOS DEMO ANTIGUOS
  // ============================================================

  private limpiarDepartamentosDemo(lista: Departamento[]): Departamento[] {
    return lista.filter((departamento) => {
      const esDemo =
        this.TITULOS_DEMO.has((departamento.Titulo || '').trim()) &&
        (departamento.propietarioEmail || '').trim().toLowerCase() === 'propietario@depaya.com' &&
        !departamento.fechaPublicacion;

      return !esDemo;
    });
  }

  // ============================================================
  // NORMALIZAR CAMPOS OPCIONALES
  // ============================================================

  private normalizarDepartamentos(): void {
    this.departamentos = this.departamentos.map((departamento) => ({
      ...departamento,
      Descripcion: departamento.Descripcion ?? '',
      Capacidad: Number(departamento.Capacidad ?? 0),
      TienePiscina: Boolean(departamento.TienePiscina),
      TieneWifi: Boolean(departamento.TieneWifi),
      AdmiteMascotas: Boolean(departamento.AdmiteMascotas),
    }));
  }

  // ============================================================
  // SINCRONIZAR DESDE LOCALSTORAGE
  // ============================================================

  private sincronizar(): void {
    const datos = localStorage.getItem(this.STORAGE_KEY);

    if (!datos) {
      this.departamentos = [];
      return;
    }

    try {
      const lista = JSON.parse(datos);

      if (Array.isArray(lista)) {
        this.departamentos = this.limpiarDepartamentosDemo(lista);
        this.normalizarDepartamentos();
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
      Descripcion: (departamento.Descripcion || '').trim(),
      Capacidad: Number(departamento.Capacidad ?? 0),
      TienePiscina: Boolean(departamento.TienePiscina),
      TieneWifi: Boolean(departamento.TieneWifi),
      AdmiteMascotas: Boolean(departamento.AdmiteMascotas),
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
      propietarioEmail: departamento.propietarioEmail.trim().toLowerCase(),
      Descripcion: (departamento.Descripcion || '').trim(),
      Capacidad: Number(departamento.Capacidad ?? 0),
      TienePiscina: Boolean(departamento.TienePiscina),
      TieneWifi: Boolean(departamento.TieneWifi),
      AdmiteMascotas: Boolean(departamento.AdmiteMascotas),
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
