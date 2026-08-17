import { Component, ElementRef, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DepartamentoService } from '../../services/departamento.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-departamento-formulario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departamento-formulario.component.html',
  styleUrls: ['./departamento-formulario.component.css'],
})
export class DepartamentoFormularioComponent {
  // ============================================================
  // INPUT DE IMAGEN
  // ============================================================

  @ViewChild('inputImagen')
  inputImagen?: ElementRef<HTMLInputElement>;

  // ============================================================
  // CAMPOS DEL FORMULARIO
  // ============================================================

  titulo = '';
  distrito = '';
  precioNoche: number | null = null;
  capacidad: number | null = null;
  habitaciones: number | null = null;
  banos: number | null = null;
  categoria = '';
  descripcion = '';

  // ============================================================
  // SERVICIOS Y COMODIDADES
  // ============================================================

  tienePiscina = false;
  tieneWifi = false;
  admiteMascotas = false;

  // ============================================================
  // IMAGEN
  // ============================================================

  imagenBase64 = '';
  nombreImagen = '';

  // ============================================================
  // ESTADOS
  // ============================================================

  publicando = false;
  mensaje = '';
  error = '';

  // ============================================================
  // OPCIONES
  // ============================================================

  distritos: string[] = [
    'Miraflores',
    'San Isidro',
    'Barranco',
    'Surco',
    'San Miguel',
    'Chorrillos',
    'La Molina',
    'Jesús María',
    'Magdalena',
    'Pueblo Libre',
    'Lince',
    'San Borja',
  ];

  categorias: string[] = ['Moderno', 'Loft', 'Familiar', 'Ejecutivo', 'Vista al mar', 'Playa'];

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private departamentoService: DepartamentoService,
    private authService: AuthService,
  ) {}

  // ============================================================
  // SELECCIONAR IMAGEN
  // ============================================================

  seleccionarImagen(event: Event): void {
    this.error = '';

    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith('image/')) {
      this.error = 'Selecciona una imagen válida.';
      input.value = '';
      return;
    }

    if (archivo.size > 10 * 1024 * 1024) {
      this.error = 'La imagen no puede superar los 10 MB.';
      input.value = '';
      return;
    }

    this.nombreImagen = archivo.name;
    this.procesarImagen(archivo);
  }

  // ============================================================
  // PROCESAR / COMPRIMIR IMAGEN
  // ============================================================

  private procesarImagen(archivo: File): void {
    const lector = new FileReader();

    lector.onload = () => {
      const imagen = new Image();

      imagen.onload = () => {
        const maxAncho = 1200;
        const maxAlto = 900;

        let ancho = imagen.width;
        let alto = imagen.height;

        if (ancho > maxAncho || alto > maxAlto) {
          const escala = Math.min(maxAncho / ancho, maxAlto / alto);
          ancho = Math.round(ancho * escala);
          alto = Math.round(alto * escala);
        }

        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;

        const contexto = canvas.getContext('2d');

        if (!contexto) {
          this.error = 'No se pudo procesar la fotografía.';
          return;
        }

        contexto.drawImage(imagen, 0, 0, ancho, alto);
        this.imagenBase64 = canvas.toDataURL('image/jpeg', 0.72);
      };

      imagen.onerror = () => {
        this.error = 'No se pudo cargar la fotografía.';
        this.imagenBase64 = '';
      };

      imagen.src = lector.result as string;
    };

    lector.onerror = () => {
      this.error = 'No se pudo leer la fotografía.';
      this.imagenBase64 = '';
    };

    lector.readAsDataURL(archivo);
  }

  // ============================================================
  // QUITAR IMAGEN
  // ============================================================

  quitarImagen(): void {
    this.imagenBase64 = '';
    this.nombreImagen = '';

    if (this.inputImagen?.nativeElement) {
      this.inputImagen.nativeElement.value = '';
    }
  }

  // ============================================================
  // PUBLICAR DEPARTAMENTO
  // ============================================================

  publicar(): void {
    this.mensaje = '';
    this.error = '';

    const usuario = this.authService.obtenerUsuarioActual();

    if (!usuario) {
      this.error = 'Debes iniciar sesión para publicar un departamento.';
      return;
    }

    if (usuario.rol !== 'PROPIETARIO') {
      this.error = 'Solo los propietarios pueden publicar departamentos.';
      return;
    }

    if (usuario.PublicacionesHabilitadas === false) {
      this.error =
        'Tus publicaciones están desactivadas. Si deseas volver a publicar, debes comunicarte con el administrador de DepaYa para solicitar la reactivación.';
      return;
    }

    if (!this.titulo.trim()) {
      this.error = 'Ingrese el título del inmueble.';
      return;
    }

    if (!this.distrito) {
      this.error = 'Seleccione un distrito.';
      return;
    }

    if (this.precioNoche === null || Number(this.precioNoche) <= 0) {
      this.error = 'Ingrese un precio por noche válido.';
      return;
    }

    if (this.capacidad === null || Number(this.capacidad) <= 0) {
      this.error = 'Ingrese la capacidad del inmueble.';
      return;
    }

    if (this.habitaciones === null || Number(this.habitaciones) <= 0) {
      this.error = 'Ingrese la cantidad de habitaciones.';
      return;
    }

    if (this.banos === null || Number(this.banos) <= 0) {
      this.error = 'Ingrese la cantidad de baños.';
      return;
    }

    if (!this.categoria) {
      this.error = 'Seleccione una categoría.';
      return;
    }

    if (!this.descripcion.trim()) {
      this.error = 'Ingrese una descripción del inmueble.';
      return;
    }

    if (!this.imagenBase64) {
      this.error = 'Debes seleccionar una fotografía del inmueble.';
      return;
    }

    this.publicando = true;

    try {
      const nuevoDepartamento: any = {
        id: 0,
        Titulo: this.titulo.trim(),
        Distrito: this.distrito,
        Precio_Noche: Number(this.precioNoche),
        Habitaciones: Number(this.habitaciones),
        Banos: Number(this.banos),
        Categoria: this.categoria,
        URL_Imagen: this.imagenBase64,
        propietarioEmail: usuario.email.trim().toLowerCase(),
        Descripcion: this.descripcion.trim(),
        Capacidad: Number(this.capacidad),
        TienePiscina: this.tienePiscina,
        TieneWifi: this.tieneWifi,
        AdmiteMascotas: this.admiteMascotas,
        fechaPublicacion: new Date().toISOString(),
      };

      this.departamentoService.agregarDepartamento(nuevoDepartamento);
      this.mensaje = '¡Departamento publicado correctamente!';
      this.limpiarFormulario();
    } catch (error) {
      console.error('Error publicando departamento:', error);
      this.error = 'No se pudo publicar el departamento.';
    } finally {
      this.publicando = false;
    }
  }

  // ============================================================
  // LIMPIAR FORMULARIO
  // ============================================================

  private limpiarFormulario(): void {
    this.titulo = '';
    this.distrito = '';
    this.precioNoche = null;
    this.capacidad = null;
    this.habitaciones = null;
    this.banos = null;
    this.categoria = '';
    this.descripcion = '';
    this.tienePiscina = false;
    this.tieneWifi = false;
    this.admiteMascotas = false;
    this.imagenBase64 = '';
    this.nombreImagen = '';

    if (this.inputImagen?.nativeElement) {
      this.inputImagen.nativeElement.value = '';
    }
  }
}
