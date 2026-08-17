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
  // BUSCADORES POR DNI
  // ============================================================

  busquedaUsuarioDni = '';

  busquedaDepartamentoDni = '';

  // ============================================================
  // DATOS DEMO QUE YA NO DEBEN MOSTRARSE
  // ============================================================

  private readonly TITULOS_DEMO = new Set([
    'Loft Ejecutivo Prime con Vista al Mar',
    'Departamento Moderno en San Isidro',
    'Departamento Familiar en Barranco',
    'Departamento con Vista al Mar',
    'Loft Ejecutivo Moderno',
    'Casa de Playa Familiar',
  ]);

  // ============================================================
  // MODAL USUARIO
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

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

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
      // --------------------------------------------------------
      // PROCESAR REEMBOLSOS QUE YA CUMPLIERON 48 HORAS
      // --------------------------------------------------------

      const reembolsosAutomaticos = this.pagoService.procesarReembolsosVencidos();

      reembolsosAutomaticos.forEach((pago) => {
        this.reservaService.marcarReembolsoDevuelto(
          pago.reservaId,
          pago.metodo,
          pago.fechaReembolso,
        );
      });

      // --------------------------------------------------------
      // USUARIOS
      // --------------------------------------------------------

      this.cargarUsuarios();

      // --------------------------------------------------------
      // DEPARTAMENTOS
      // --------------------------------------------------------

      this.departamentos = this.departamentoService.getDepartamentos();

      // --------------------------------------------------------
      // RESERVAS
      // --------------------------------------------------------

      this.reservas = this.reservaService
        .listar()
        .filter((reserva) => !this.esRegistroDemo(reserva.departamento))
        .sort((a, b) => new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime());

      // --------------------------------------------------------
      // PAGOS
      // --------------------------------------------------------

      this.pagos = this.pagoService
        .listar()
        .filter((pago) => !this.esRegistroDemo(pago.departamento))
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    } catch (error) {
      console.error('Error cargando información del administrador:', error);

      this.error = 'No se pudo cargar toda la información del sistema.';
    } finally {
      this.cargando = false;
    }
  }

  // ============================================================
  // OCULTAR REGISTROS DEMO ANTIGUOS
  // ============================================================

  private esRegistroDemo(nombreDepartamento: string | undefined | null): boolean {
    return this.TITULOS_DEMO.has((nombreDepartamento || '').trim());
  }

  // ============================================================
  // USUARIOS
  // ============================================================

  cargarUsuarios(): void {
    this.usuarios = this.authService.listarUsuarios();
  }

  // ============================================================
  // NUEVO USUARIO
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

    // ----------------------------------------------------------
    // NOMBRE
    // ----------------------------------------------------------

    if (!this.form.nombre || !this.form.nombre.trim()) {
      this.error = 'Ingrese el nombre del usuario.';

      return;
    }

    // ----------------------------------------------------------
    // EMAIL
    // ----------------------------------------------------------

    if (!this.form.email || !this.form.email.trim()) {
      this.error = 'Ingrese el correo electrónico.';

      return;
    }

    const email = this.form.email.trim().toLowerCase();

    if (!this.validarCorreo(email)) {
      this.error = 'Ingrese un correo electrónico válido.';

      return;
    }

    // ----------------------------------------------------------
    // PASSWORD
    // ----------------------------------------------------------

    if (!this.form.password || this.form.password.length < 6) {
      this.error = 'La contraseña debe tener mínimo 6 caracteres.';

      return;
    }

    // ----------------------------------------------------------
    // TELÉFONO
    // ----------------------------------------------------------

    if (this.form.telefono && this.form.telefono.trim()) {
      const telefono = this.form.telefono.trim().replace(/\s/g, '');

      if (!/^\d{9}$/.test(telefono)) {
        this.error = 'El teléfono debe contener 9 dígitos.';

        return;
      }

      this.form.telefono = telefono;
    }

    // ----------------------------------------------------------
    // DNI
    // ----------------------------------------------------------

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

      // ADMIN PRINCIPAL

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
  // ESTADO / REACTIVACIÓN DEL PROPIETARIO
  // ============================================================

  propietarioNecesitaReactivacion(usuario: Usuario): boolean {
    return (
      usuario.rol === 'PROPIETARIO' &&
      (usuario.Activo === false || usuario.PublicacionesHabilitadas === false)
    );
  }

  obtenerTextoEstadoUsuario(usuario: Usuario): string {
    if (usuario.Activo === false) {
      return 'Cuenta inactiva';
    }

    if (usuario.rol === 'PROPIETARIO' && usuario.PublicacionesHabilitadas === false) {
      return 'Publicaciones desactivadas';
    }

    return 'Activo';
  }

  obtenerClaseEstadoUsuario(usuario: Usuario): string {
    if (usuario.Activo === false) {
      return 'cuenta-inactiva';
    }

    if (usuario.rol === 'PROPIETARIO' && usuario.PublicacionesHabilitadas === false) {
      return 'publicaciones-inactivas';
    }

    return 'cuenta-activa';
  }

  reactivarPropietario(usuario: Usuario): void {
    this.limpiarMensajes();

    if (usuario.id == null) {
      this.error = 'No se pudo identificar al propietario.';
      return;
    }

    if (usuario.rol !== 'PROPIETARIO') {
      this.error = 'La reactivación de publicaciones aplica a propietarios.';
      return;
    }

    if (!this.propietarioNecesitaReactivacion(usuario)) {
      this.error = 'La cuenta del propietario ya se encuentra activa.';
      return;
    }

    const nombreCompleto = `${usuario.nombre} ${usuario.apellido || ''}`.trim();

    const confirmar = window.confirm(
      `¿Reactivar al propietario ${nombreCompleto}?\n\n` +
        `Se habilitará nuevamente su cuenta, la publicación de nuevos departamentos ` +
        `y se reactivarán sus departamentos desactivados.`,
    );

    if (!confirmar) {
      return;
    }

    const usuarioReactivado = this.authService.reactivarUsuario(usuario.id);

    if (!usuarioReactivado) {
      this.error = 'No se pudo reactivar la cuenta del propietario.';
      return;
    }

    const departamentosReactivados = this.departamentoService.reactivarDepartamentosPropietario(
      usuario.email,
    );

    this.cargarTodo();

    this.mensaje =
      departamentosReactivados === 1
        ? `Cuenta reactivada correctamente. Se reactivó 1 departamento de ${nombreCompleto}.`
        : `Cuenta reactivada correctamente. Se reactivaron ${departamentosReactivados} departamentos de ${nombreCompleto}.`;
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

    const confirmar = window.confirm(`¿Deseas eliminar al usuario ${nombreCompleto}?`);

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
  // BÚSQUEDA POR DNI
  // ============================================================

  private normalizarDni(valor: string | undefined | null): string {
    return (valor || '').replace(/\D/g, '');
  }

  obtenerUsuarioPorEmail(email: string | undefined | null): Usuario | undefined {
    const correo = (email || '').trim().toLowerCase();

    if (!correo) {
      return undefined;
    }

    return this.usuarios.find((usuario) => (usuario.email || '').trim().toLowerCase() === correo);
  }

  obtenerDniPropietario(email: string | undefined | null): string {
    const propietario = this.obtenerUsuarioPorEmail(email);

    if (!propietario) {
      return 'Sin DNI';
    }

    const documento = (propietario.nroDoc || '').trim();

    return documento || 'Sin DNI';
  }

  get usuariosFiltrados(): Usuario[] {
    const dni = this.normalizarDni(this.busquedaUsuarioDni);

    if (!dni) {
      return this.usuarios;
    }

    return this.usuarios.filter((usuario) => this.normalizarDni(usuario.nroDoc).includes(dni));
  }

  get departamentosFiltrados(): Departamento[] {
    const dni = this.normalizarDni(this.busquedaDepartamentoDni);

    if (!dni) {
      return this.departamentos;
    }

    return this.departamentos.filter((departamento) => {
      const dniPropietario = this.normalizarDni(
        this.obtenerDniPropietario(departamento.propietarioEmail),
      );

      return dniPropietario.includes(dni);
    });
  }

  limpiarBusquedaUsuario(): void {
    this.busquedaUsuarioDni = '';
  }

  limpiarBusquedaDepartamento(): void {
    this.busquedaDepartamentoDni = '';
  }

  // ============================================================
  // REEMBOLSO - ADMIN
  // ============================================================

  puedeDevolver(pago: Pago): boolean {
    return String(pago.estado) === 'REEMBOLSO_PENDIENTE';
  }

  // ============================================================
  // DEVOLVER DINERO
  // ============================================================

  devolverPago(pago: Pago): void {
    this.limpiarMensajes();

    if (!this.puedeDevolver(pago)) {
      this.error = 'Este pago no tiene un reembolso pendiente.';

      return;
    }

    const metodo = this.pagoService.obtenerNombreMetodo(pago.metodo);

    const confirmar = window.confirm(
      `¿Confirmar devolución?\n\n` +
        `Inquilino: ${pago.inquilinoNombre}\n` +
        `Departamento: ${pago.departamento}\n` +
        `Monto: S/ ${Number(pago.monto).toFixed(2)}\n` +
        `Método: ${metodo}\n\n` +
        `El pago quedará marcado como DEVUELTO COMPLETO.`,
    );

    if (!confirmar) {
      return;
    }

    const reembolso = this.pagoService.confirmarReembolso(pago.id);

    if (!reembolso) {
      this.error = 'No se pudo procesar el reembolso.';

      return;
    }

    const reservaActualizada = this.reservaService.marcarReembolsoDevuelto(
      pago.reservaId,
      pago.metodo,
      reembolso.fechaReembolso,
    );

    if (!reservaActualizada) {
      this.error = 'El pago fue reembolsado, pero no se pudo actualizar la reserva.';

      this.cargarTodo();

      return;
    }

    this.mensaje =
      `Reembolso completo de S/ ${Number(pago.monto).toFixed(2)} ` +
      `procesado correctamente por ${metodo}.`;

    this.cargarTodo();
  }

  // ============================================================
  // MÉTODO DE PAGO
  // ============================================================

  obtenerMetodoPago(pago: Pago): string {
    return this.pagoService.obtenerNombreMetodo(pago.metodo);
  }

  // ============================================================
  // TEXTO PAGO
  // ============================================================

  obtenerTextoPago(pago: Pago): string {
    return this.pagoService.obtenerNombreEstado(pago.estado);
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
  // RESERVA
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
  // ESTADO REEMBOLSO RESERVA
  // ============================================================

  obtenerTextoReembolsoReserva(reserva: Reserva): string {
    if (reserva.estado !== 'CANCELADA') {
      return '—';
    }

    if (reserva.estadoReembolso === 'PENDIENTE') {
      return 'Reembolso pendiente';
    }

    if (reserva.estadoReembolso === 'DEVUELTO') {
      return 'Devuelto completo';
    }

    return 'Sin reembolso';
  }

  obtenerClaseReembolsoReserva(reserva: Reserva): string {
    if (reserva.estadoReembolso === 'PENDIENTE') {
      return 'reembolso-pendiente';
    }

    if (reserva.estadoReembolso === 'DEVUELTO') {
      return 'reembolso-devuelto';
    }

    return 'reembolso-none';
  }

  // ============================================================
  // ESTADO PAGO
  // ============================================================

  obtenerClasePago(estado: string): string {
    switch (estado) {
      case 'COMPLETADO':
        return 'estado-verde';

      case 'PROCESANDO':
        return 'estado-amarillo';

      case 'REEMBOLSO_PENDIENTE':
        return 'estado-naranja';

      case 'REEMBOLSADO':
        return 'estado-azul';

      case 'CANCELADO':
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
  // LIMPIAR MENSAJES
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

  // ============================================================
  // PORCENTAJE COMISIÓN DEPAYA
  // ============================================================

  readonly porcentajeComisionDepaYa = 10;

  private readonly COMISION_DEPAYA = 0.1;

  // ============================================================
  // TOTAL BRUTO PROCESADO
  // ============================================================

  get totalIngresos(): number {
    return this.pagos
      .filter((pago) => pago.estado === 'COMPLETADO')
      .reduce(
        (total, pago) => total + Number(pago.monto),

        0,
      );
  }

  // ============================================================
  // COMISIÓN DE UN PAGO
  // ============================================================

  calcularComisionDepaYa(pago: Pago): number {
    if (pago.estado !== 'COMPLETADO') {
      return 0;
    }

    return Number(pago.monto) * this.COMISION_DEPAYA;
  }

  // ============================================================
  // NETO DEL PROPIETARIO
  // ============================================================

  calcularNetoPropietario(pago: Pago): number {
    if (pago.estado !== 'COMPLETADO') {
      return 0;
    }

    return Number(pago.monto) - this.calcularComisionDepaYa(pago);
  }

  // ============================================================
  // TOTAL DE COMISIONES DEPAYA
  // ============================================================

  get totalComisionesDepaYa(): number {
    return this.pagos
      .filter((pago) => pago.estado === 'COMPLETADO')
      .reduce(
        (total, pago) => total + this.calcularComisionDepaYa(pago),

        0,
      );
  }

  // ============================================================
  // TOTAL NETO A PROPIETARIOS
  // ============================================================

  get totalNetoPropietarios(): number {
    return this.pagos
      .filter((pago) => pago.estado === 'COMPLETADO')
      .reduce(
        (total, pago) => total + this.calcularNetoPropietario(pago),

        0,
      );
  }

  // ============================================================
  // REEMBOLSOS PENDIENTES
  // ============================================================

  get totalReembolsosPendientes(): number {
    return this.pagos.filter((pago) => pago.estado === 'REEMBOLSO_PENDIENTE').length;
  }
}
