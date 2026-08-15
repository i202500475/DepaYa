import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService, Usuario, RolUsuario } from '../../services/auth.service';

import { Departamento, DepartamentoService } from '../../services/departamento.service';

import { Reserva, ReservaService } from '../../services/reserva.service';

import { Pago, PagoService } from '../../services/pago.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  // ============================================================
  // DATOS
  // ============================================================

  usuarios: Usuario[] = [];

  departamentos: Departamento[] = [];

  reservas: Reserva[] = [];

  pagos: Pago[] = [];

  cargando = false;

  mensaje = '';

  error = '';

  // ============================================================
  // MODAL USUARIOS
  // ============================================================

  modalVisible = false;

  modoEdicion = false;

  idEdicion: number | null = null;

  form: any = {};

  roles = [
    {
      valor: 'INQUILINO',
      texto: 'Inquilino',
    },
    {
      valor: 'PROPIETARIO',
      texto: 'Propietario',
    },
    {
      valor: 'ADMIN',
      texto: 'Administrador',
    },
  ];

  tiposDocs = ['DNI', 'CE', 'Pasaporte'];

  constructor(
    private authService: AuthService,
    private departamentoService: DepartamentoService,
    private reservaService: ReservaService,
    private pagoService: PagoService,
  ) {}

  // ============================================================
  // INICIO
  // ============================================================

  ngOnInit(): void {
    this.cargarTodo();
  }

  // ============================================================
  // CARGAR TODO
  // ============================================================

  cargarTodo(): void {
    this.cargando = true;

    this.error = '';

    try {
      this.cargarUsuarios();

      this.departamentos = this.departamentoService.getDepartamentos();

      this.reservas = this.reservaService
        .listar()
        .sort((a, b) => new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime());

      this.pagos = this.pagoService
        .listar()
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    } catch (error) {
      console.error('Error cargando información del administrador:', error);

      this.error = 'No se pudo cargar toda la información del sistema.';
    } finally {
      this.cargando = false;
    }
  }

  // ============================================================
  // CARGAR USUARIOS
  // ============================================================

  cargarUsuarios(): void {
    this.usuarios = this.authService.listarUsuarios();
  }

  // ============================================================
  // CREAR USUARIO
  // ============================================================

  abrirCrear(): void {
    this.limpiarMensajes();

    this.form = {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      tipoDoc: 'DNI',
      nroDoc: '',
      password: '123456',
      rol: 'INQUILINO',
      fecha: new Date().toLocaleDateString('es-PE'),
    };

    this.modoEdicion = false;

    this.idEdicion = null;

    this.modalVisible = true;
  }

  // ============================================================
  // EDITAR USUARIO
  // ============================================================

  abrirEditar(usuario: Usuario): void {
    if (usuario.id == null) {
      this.error = 'No se pudo identificar al usuario.';

      return;
    }

    this.limpiarMensajes();

    this.form = {
      nombre: usuario.nombre ?? '',

      apellido: usuario.apellido ?? '',

      email: usuario.email ?? '',

      telefono: usuario.telefono ?? '',

      tipoDoc: usuario.tipoDoc ?? 'DNI',

      nroDoc: usuario.nroDoc ?? '',

      password: usuario.password || '123456',

      rol: usuario.rol,

      fecha: usuario.fecha || new Date().toLocaleDateString('es-PE'),
    };

    this.idEdicion = usuario.id;

    this.modoEdicion = true;

    this.modalVisible = true;
  }

  // ============================================================
  // GUARDAR USUARIO
  // ============================================================

  guardarUsuario(): void {
    this.limpiarMensajes();

    if (!this.form.nombre || !this.form.nombre.trim()) {
      this.error = 'Ingrese el nombre del usuario.';

      return;
    }

    if (!this.form.email || !this.form.email.trim()) {
      this.error = 'Ingrese el correo electrónico.';

      return;
    }

    const email = this.form.email.trim().toLowerCase();

    if (!this.validarCorreo(email)) {
      this.error = 'Ingrese un correo electrónico válido.';

      return;
    }

    if (!this.form.password || this.form.password.length < 6) {
      this.error = 'La contraseña debe tener mínimo 6 caracteres.';

      return;
    }

    if (this.form.telefono && this.form.telefono.trim()) {
      const telefono = this.form.telefono.trim().replace(/\s/g, '');

      if (!/^\d{9}$/.test(telefono)) {
        this.error = 'El teléfono debe contener 9 dígitos.';

        return;
      }

      this.form.telefono = telefono;
    }

    if (this.form.tipoDoc === 'DNI' && this.form.nroDoc && this.form.nroDoc.trim()) {
      if (!/^\d{8}$/.test(this.form.nroDoc.trim())) {
        this.error = 'El DNI debe contener 8 dígitos.';

        return;
      }
    }

    // ==========================================================
    // EDITAR
    // ==========================================================

    if (this.modoEdicion) {
      if (this.idEdicion == null) {
        this.error = 'No se encontró el usuario.';

        return;
      }

      const usuarioOriginal = this.authService.obtenerUsuarioPorId(this.idEdicion);

      if (!usuarioOriginal) {
        this.error = 'El usuario ya no existe.';

        return;
      }

      if (usuarioOriginal.email.trim().toLowerCase() === 'admin@depaya.com') {
        if (email !== 'admin@depaya.com') {
          this.error = 'No puede cambiar el correo del administrador principal.';

          return;
        }

        this.form.rol = 'ADMIN';
      }

      const usuarioActualizado: Usuario = {
        id: this.idEdicion,

        nombre: this.form.nombre.trim(),

        apellido: this.form.apellido?.trim() || '',

        email,

        password: this.form.password,

        telefono: this.form.telefono?.trim() || '',

        tipoDoc: this.form.tipoDoc || 'DNI',

        nroDoc: this.form.nroDoc?.trim() || '',

        rol: this.form.rol as RolUsuario,

        fecha: usuarioOriginal.fecha || new Date().toLocaleDateString('es-PE'),
      };

      const actualizado = this.authService.actualizarUsuario(usuarioActualizado);

      if (!actualizado) {
        this.error = 'No se pudo actualizar. Verifique que el correo no esté registrado.';

        return;
      }

      this.mensaje = 'Usuario actualizado correctamente.';
    }

    // ==========================================================
    // CREAR
    // ==========================================================
    else {
      const nuevoUsuario: Usuario = {
        nombre: this.form.nombre.trim(),

        apellido: this.form.apellido?.trim() || '',

        email,

        password: this.form.password,

        telefono: this.form.telefono?.trim() || '',

        tipoDoc: this.form.tipoDoc || 'DNI',

        nroDoc: this.form.nroDoc?.trim() || '',

        rol: this.form.rol as RolUsuario,

        fecha: new Date().toLocaleDateString('es-PE'),
      };

      const registrado = this.authService.registrar(nuevoUsuario);

      if (!registrado) {
        this.error = 'Ya existe un usuario registrado con ese correo.';

        return;
      }

      this.mensaje = 'Usuario registrado correctamente.';
    }

    this.cargarUsuarios();

    this.cerrarModal(false);
  }

  // ============================================================
  // ELIMINAR USUARIO
  // ============================================================

  eliminarUsuario(usuario: Usuario): void {
    this.limpiarMensajes();

    if (usuario.id == null) {
      this.error = 'No se pudo identificar al usuario.';

      return;
    }

    if (usuario.email.trim().toLowerCase() === 'admin@depaya.com') {
      this.error = 'El administrador principal no puede eliminarse.';

      return;
    }

    const nombreCompleto = `${usuario.nombre} ${usuario.apellido || ''}`.trim();

    const confirmar = confirm(`¿Deseas eliminar al usuario ${nombreCompleto}?`);

    if (!confirmar) {
      return;
    }

    const eliminado = this.authService.eliminarUsuario(usuario.id);

    if (!eliminado) {
      this.error = 'No se pudo eliminar el usuario.';

      return;
    }

    this.cargarUsuarios();

    this.mensaje = 'Usuario eliminado correctamente.';
  }

  // ============================================================
  // CERRAR MODAL
  // ============================================================

  cerrarModal(limpiarMensajes = true): void {
    this.modalVisible = false;

    this.modoEdicion = false;

    this.idEdicion = null;

    this.form = {};

    if (limpiarMensajes) {
      this.error = '';
    }
  }

  // ============================================================
  // ROL
  // ============================================================

  obtenerNombreRol(rol: string): string {
    switch (rol) {
      case 'ADMIN':
        return 'Administrador';

      case 'PROPIETARIO':
        return 'Propietario';

      case 'INQUILINO':
        return 'Inquilino';

      default:
        return rol;
    }
  }

  obtenerClaseRol(rol: string): string {
    switch (rol) {
      case 'ADMIN':
        return 'admin';

      case 'PROPIETARIO':
        return 'propietario';

      case 'INQUILINO':
        return 'inquilino';

      default:
        return '';
    }
  }

  // ============================================================
  // ESTADOS RESERVAS
  // ============================================================

  obtenerClaseReserva(estado: string): string {
    switch (estado) {
      case 'CONFIRMADA':
        return 'estado-verde';

      case 'PENDIENTE':
        return 'estado-amarillo';

      case 'CANCELADA':
        return 'estado-rojo';

      default:
        return '';
    }
  }

  // ============================================================
  // ESTADOS PAGOS
  // ============================================================

  obtenerClasePago(estado: string): string {
    switch (estado) {
      case 'COMPLETADO':
        return 'estado-verde';

      case 'PROCESANDO':
        return 'estado-amarillo';

      case 'REEMBOLSADO':
        return 'estado-rojo';

      default:
        return '';
    }
  }

  // ============================================================
  // VALIDAR EMAIL
  // ============================================================

  private validarCorreo(correo: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  }

  // ============================================================
  // MENSAJES
  // ============================================================

  private limpiarMensajes(): void {
    this.mensaje = '';

    this.error = '';
  }

  // ============================================================
  // CONTADORES
  // ============================================================

  get totalUsuarios(): number {
    return this.usuarios.length;
  }

  get totalDepartamentos(): number {
    return this.departamentos.length;
  }

  get totalReservas(): number {
    return this.reservas.length;
  }

  get totalPagos(): number {
    return this.pagos.length;
  }

  get totalIngresos(): number {
    return this.pagos
      .filter((pago) => pago.estado === 'COMPLETADO')
      .reduce((total, pago) => total + pago.monto, 0);
  }
}
