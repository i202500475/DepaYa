import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { AuthService, Usuario, RolUsuario } from '../../services/auth.service';

import { Departamento, DepartamentoService } from '../../services/departamento.service';

import { Reserva, ReservaService } from '../../services/reserva.service';

import { Pago, PagoService } from '../../services/pago.service';

import * as XLSX from 'xlsx';

type EstadoLiquidacion = 'PENDIENTE' | 'LIQUIDADO' | 'NO_APLICA';

interface RegistroLiquidacion {
  estado: 'LIQUIDADO';
  fecha: string;
}

interface PuntoGraficoFinanciero {
  clave: string;
  etiqueta: string;
  total: number;
  comision: number;
  neto: number;
  porcentajeTotal: number;
  porcentajeComision: number;
}

interface ResumenMetodoPago {
  metodo: string;
  nombre: string;
  cantidad: number;
  total: number;
  porcentaje: number;
}

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
  // FILTROS DEL REPORTE FINANCIERO
  // ============================================================

  fechaDesdeReporte = '';

  fechaHastaReporte = '';

  estadoPagoReporte = '';

  metodoPagoReporte = '';

  propietarioPagoReporte = '';

  estadoLiquidacionReporte = '';

  busquedaPago = '';

  // ============================================================
  // DETALLE DEL PAGO
  // ============================================================

  pagoSeleccionado: Pago | null = null;

  // ============================================================
  // LIQUIDACIONES A PROPIETARIOS
  // Se guardan separadas para no alterar el modelo de Pago.
  // ============================================================

  private readonly LIQUIDACIONES_STORAGE_KEY =
    'depayaLiquidacionesPropietarios';

  private liquidaciones: Record<string, RegistroLiquidacion> = {};


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
    this.cargarLiquidaciones();
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
  // REPORTE FINANCIERO - FILTROS
  // ============================================================

  private fechaInputATimestamp(fecha: string, finDelDia = false): number {
    if (!fecha) {
      return NaN;
    }

    const partes = fecha.split('-');

    if (partes.length !== 3) {
      return NaN;
    }

    const anio = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    if (!anio || !mes || !dia) {
      return NaN;
    }

    return finDelDia
      ? new Date(anio, mes - 1, dia, 23, 59, 59, 999).getTime()
      : new Date(anio, mes - 1, dia, 0, 0, 0, 0).getTime();
  }

  private timestampPago(pago: Pago): number {
    const fecha = String(pago.fecha || '').trim();

    if (!fecha) {
      return NaN;
    }

    return new Date(fecha).getTime();
  }

  private normalizarTextoBusqueda(valor: unknown): string {
    return String(valor ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  get rangoFechasReporteInvalido(): boolean {
    if (!this.fechaDesdeReporte || !this.fechaHastaReporte) {
      return false;
    }

    const desde = this.fechaInputATimestamp(this.fechaDesdeReporte);
    const hasta = this.fechaInputATimestamp(this.fechaHastaReporte, true);

    if (!Number.isFinite(desde) || !Number.isFinite(hasta)) {
      return false;
    }

    return desde > hasta;
  }

  get propietariosFinancieros(): Array<{
    email: string;
    nombre: string;
    dni: string;
  }> {
    const correos = Array.from(
      new Set(
        this.pagos
          .map((pago) => String(pago.propietarioEmail || '').trim().toLowerCase())
          .filter(Boolean),
      ),
    );

    return correos
      .map((email) => {
        const usuario = this.obtenerUsuarioPorEmail(email);

        return {
          email,
          nombre: usuario
            ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || email
            : email,
          dni: this.obtenerDniPropietario(email),
        };
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  get pagosFiltradosReporte(): Pago[] {
    if (this.rangoFechasReporteInvalido) {
      return [];
    }

    const desde = this.fechaDesdeReporte
      ? this.fechaInputATimestamp(this.fechaDesdeReporte)
      : NaN;

    const hasta = this.fechaHastaReporte
      ? this.fechaInputATimestamp(this.fechaHastaReporte, true)
      : NaN;

    const estado = String(this.estadoPagoReporte || '').trim().toUpperCase();
    const metodo = String(this.metodoPagoReporte || '').trim().toUpperCase();
    const propietario = String(this.propietarioPagoReporte || '').trim().toLowerCase();
    const liquidacion = String(this.estadoLiquidacionReporte || '').trim().toUpperCase();
    const busqueda = this.normalizarTextoBusqueda(this.busquedaPago);

    return this.pagos.filter((pago) => {
      const fechaPago = this.timestampPago(pago);

      if (Number.isFinite(desde)) {
        if (!Number.isFinite(fechaPago) || fechaPago < desde) {
          return false;
        }
      }

      if (Number.isFinite(hasta)) {
        if (!Number.isFinite(fechaPago) || fechaPago > hasta) {
          return false;
        }
      }

      if (estado && String(pago.estado || '').trim().toUpperCase() !== estado) {
        return false;
      }

      if (metodo && String(pago.metodo || '').trim().toUpperCase() !== metodo) {
        return false;
      }

      if (
        propietario &&
        String(pago.propietarioEmail || '').trim().toLowerCase() !== propietario
      ) {
        return false;
      }

      if (
        liquidacion &&
        this.obtenerEstadoLiquidacion(pago) !== liquidacion
      ) {
        return false;
      }

      if (busqueda) {
        const contenido = this.normalizarTextoBusqueda(
          [
            pago.id,
            pago.reservaId,
            pago.departamento,
            pago.inquilinoNombre,
            pago.inquilinoEmail,
            pago.propietarioEmail,
            this.obtenerDniPropietario(pago.propietarioEmail),
            pago.metodo,
            pago.estado,
            this.obtenerTextoPago(pago),
            this.obtenerMetodoPago(pago),
          ].join(' '),
        );

        if (!contenido.includes(busqueda)) {
          return false;
        }
      }

      return true;
    });
  }

  limpiarFiltrosFinancieros(): void {
    this.fechaDesdeReporte = '';
    this.fechaHastaReporte = '';
    this.estadoPagoReporte = '';
    this.metodoPagoReporte = '';
    this.propietarioPagoReporte = '';
    this.estadoLiquidacionReporte = '';
    this.busquedaPago = '';
  }

  private formatearFechaHoraReporte(fecha: string | undefined | null): string {
    const valor = String(fecha || '').trim();

    if (!valor) {
      return '';
    }

    const fechaObj = new Date(valor);

    if (Number.isNaN(fechaObj.getTime())) {
      return valor;
    }

    return fechaObj.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private obtenerTextoPeriodoReporte(): string {
    if (this.fechaDesdeReporte && this.fechaHastaReporte) {
      return `${this.fechaDesdeReporte} al ${this.fechaHastaReporte}`;
    }

    if (this.fechaDesdeReporte) {
      return `Desde ${this.fechaDesdeReporte}`;
    }

    if (this.fechaHastaReporte) {
      return `Hasta ${this.fechaHastaReporte}`;
    }

    return 'Todo el historial';
  }

  private obtenerTextoFiltroEstado(): string {
    if (!this.estadoPagoReporte) {
      return 'Todos los estados';
    }

    const pagoReferencia = this.pagos.find(
      (pago) => String(pago.estado) === String(this.estadoPagoReporte),
    );

    return pagoReferencia
      ? this.obtenerTextoPago(pagoReferencia)
      : this.estadoPagoReporte;
  }

  private obtenerTextoFiltroMetodo(): string {
    if (!this.metodoPagoReporte) {
      return 'Todos los métodos';
    }

    const pagoReferencia = this.pagos.find(
      (pago) => String(pago.metodo) === String(this.metodoPagoReporte),
    );

    return pagoReferencia
      ? this.obtenerMetodoPago(pagoReferencia)
      : this.metodoPagoReporte;
  }

  private obtenerTextoFiltroPropietario(): string {
    if (!this.propietarioPagoReporte) {
      return 'Todos los propietarios';
    }

    const propietario = this.propietariosFinancieros.find(
      (item) => item.email === this.propietarioPagoReporte,
    );

    return propietario
      ? `${propietario.nombre} · DNI ${propietario.dni} · ${propietario.email}`
      : this.propietarioPagoReporte;
  }

  // ============================================================
  // REPORTE FINANCIERO - TOTALES E INDICADORES
  // ============================================================

  get pagosCompletadosReporte(): Pago[] {
    return this.pagosFiltradosReporte.filter(
      (pago) => pago.estado === 'COMPLETADO',
    );
  }

  get totalPagosCompletadosReporte(): number {
    return this.pagosCompletadosReporte.length;
  }

  get totalIngresosReporte(): number {
    return this.pagosCompletadosReporte.reduce(
      (total, pago) => total + Number(pago.monto),
      0,
    );
  }

  get totalComisionesDepaYaReporte(): number {
    return this.pagosCompletadosReporte.reduce(
      (total, pago) => total + this.calcularComisionDepaYa(pago),
      0,
    );
  }

  get totalNetoPropietariosReporte(): number {
    return this.pagosCompletadosReporte.reduce(
      (total, pago) => total + this.calcularNetoPropietario(pago),
      0,
    );
  }

  get totalReembolsosPendientesReporte(): number {
    return this.pagosFiltradosReporte.filter(
      (pago) => pago.estado === 'REEMBOLSO_PENDIENTE',
    ).length;
  }

  get totalReembolsadosReporte(): number {
    return this.pagosFiltradosReporte.filter(
      (pago) => pago.estado === 'REEMBOLSADO',
    ).length;
  }

  get ticketPromedioReporte(): number {
    if (this.totalPagosCompletadosReporte === 0) {
      return 0;
    }

    return this.totalIngresosReporte / this.totalPagosCompletadosReporte;
  }

  get metodoMasUsadoReporte(): string {
    const resumen = this.resumenMetodosReporte
      .slice()
      .sort((a, b) => b.cantidad - a.cantidad);

    if (resumen.length === 0 || resumen[0].cantidad === 0) {
      return '—';
    }

    return resumen[0].nombre;
  }

  get ingresosMesActual(): number {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = ahora.getMonth();

    return this.pagos
      .filter((pago) => {
        if (pago.estado !== 'COMPLETADO') {
          return false;
        }

        const fecha = new Date(String(pago.fecha || ''));

        return (
          !Number.isNaN(fecha.getTime()) &&
          fecha.getFullYear() === anio &&
          fecha.getMonth() === mes
        );
      })
      .reduce((total, pago) => total + Number(pago.monto), 0);
  }

  get totalPendientesLiquidarReporte(): number {
    return this.pagosCompletadosReporte.filter(
      (pago) => this.obtenerEstadoLiquidacion(pago) === 'PENDIENTE',
    ).length;
  }

  get montoPendienteLiquidarReporte(): number {
    return this.pagosCompletadosReporte
      .filter((pago) => this.obtenerEstadoLiquidacion(pago) === 'PENDIENTE')
      .reduce(
        (total, pago) => total + this.calcularNetoPropietario(pago),
        0,
      );
  }

  get resumenMetodosReporte(): ResumenMetodoPago[] {
    const metodos = ['YAPE', 'PLIN', 'VISA', 'MASTERCARD'];
    const totalRegistros = this.pagosFiltradosReporte.length;

    return metodos.map((metodo) => {
      const pagosMetodo = this.pagosFiltradosReporte.filter(
        (pago) => String(pago.metodo) === metodo,
      );

      const completados = pagosMetodo.filter(
        (pago) => pago.estado === 'COMPLETADO',
      );

      const pagoReferencia = this.pagos.find(
        (pago) => String(pago.metodo) === metodo,
      );

      return {
        metodo,
        nombre: pagoReferencia
          ? this.obtenerMetodoPago(pagoReferencia)
          : metodo === 'MASTERCARD'
            ? 'Mastercard'
            : metodo.charAt(0) + metodo.slice(1).toLowerCase(),
        cantidad: pagosMetodo.length,
        total: completados.reduce(
          (suma, pago) => suma + Number(pago.monto),
          0,
        ),
        porcentaje:
          totalRegistros > 0
            ? (pagosMetodo.length / totalRegistros) * 100
            : 0,
      };
    });
  }

  get graficoMensualReporte(): PuntoGraficoFinanciero[] {
    const agrupado = new Map<
      string,
      {
        etiqueta: string;
        total: number;
        comision: number;
        neto: number;
      }
    >();

    this.pagosCompletadosReporte.forEach((pago) => {
      const fecha = new Date(String(pago.fecha || ''));

      if (Number.isNaN(fecha.getTime())) {
        return;
      }

      const clave =
        `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

      const etiqueta = fecha
        .toLocaleDateString('es-PE', {
          month: 'short',
          year: '2-digit',
        })
        .replace('.', '');

      const actual = agrupado.get(clave) ?? {
        etiqueta,
        total: 0,
        comision: 0,
        neto: 0,
      };

      actual.total += Number(pago.monto);
      actual.comision += this.calcularComisionDepaYa(pago);
      actual.neto += this.calcularNetoPropietario(pago);

      agrupado.set(clave, actual);
    });

    let puntos = Array.from(agrupado.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);

    if (puntos.length === 0) {
      const ahora = new Date();

      puntos = Array.from({ length: 6 }, (_, index) => {
        const fecha = new Date(
          ahora.getFullYear(),
          ahora.getMonth() - (5 - index),
          1,
        );

        const clave =
          `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

        const etiqueta = fecha
          .toLocaleDateString('es-PE', {
            month: 'short',
            year: '2-digit',
          })
          .replace('.', '');

        return [
          clave,
          {
            etiqueta,
            total: 0,
            comision: 0,
            neto: 0,
          },
        ];
      });
    }

    const maximo = Math.max(
      1,
      ...puntos.map(([, valor]) => valor.total),
    );

    return puntos.map(([clave, valor]) => ({
      clave,
      etiqueta: valor.etiqueta,
      total: valor.total,
      comision: valor.comision,
      neto: valor.neto,
      porcentajeTotal: (valor.total / maximo) * 100,
      porcentajeComision: (valor.comision / maximo) * 100,
    }));
  }

  get propietarioSeleccionadoResumen():
    | {
    email: string;
    nombre: string;
    dni: string;
    pagos: number;
    bruto: number;
    comision: number;
    neto: number;
    pendienteLiquidar: number;
  }
    | null {
    if (!this.propietarioPagoReporte) {
      return null;
    }

    const propietario = this.propietariosFinancieros.find(
      (item) => item.email === this.propietarioPagoReporte,
    );

    if (!propietario) {
      return null;
    }

    return {
      ...propietario,
      pagos: this.totalPagosCompletadosReporte,
      bruto: this.totalIngresosReporte,
      comision: this.totalComisionesDepaYaReporte,
      neto: this.totalNetoPropietariosReporte,
      pendienteLiquidar: this.montoPendienteLiquidarReporte,
    };
  }

  // ============================================================
  // LIQUIDACIONES A PROPIETARIOS
  // ============================================================

  private cargarLiquidaciones(): void {
    if (typeof localStorage === 'undefined') {
      this.liquidaciones = {};
      return;
    }

    const datos = localStorage.getItem(this.LIQUIDACIONES_STORAGE_KEY);

    if (!datos) {
      this.liquidaciones = {};
      return;
    }

    try {
      const parsed = JSON.parse(datos);

      this.liquidaciones =
        parsed && typeof parsed === 'object'
          ? parsed
          : {};
    } catch (error) {
      console.error('Error cargando liquidaciones:', error);
      this.liquidaciones = {};
    }
  }

  private guardarLiquidaciones(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(
      this.LIQUIDACIONES_STORAGE_KEY,
      JSON.stringify(this.liquidaciones),
    );
  }

  obtenerEstadoLiquidacion(pago: Pago): EstadoLiquidacion {
    if (pago.estado !== 'COMPLETADO') {
      return 'NO_APLICA';
    }

    const registro = this.liquidaciones[String(pago.id)];

    return registro?.estado === 'LIQUIDADO'
      ? 'LIQUIDADO'
      : 'PENDIENTE';
  }

  obtenerTextoLiquidacion(pago: Pago): string {
    const estado = this.obtenerEstadoLiquidacion(pago);

    if (estado === 'LIQUIDADO') {
      return 'Liquidado';
    }

    if (estado === 'PENDIENTE') {
      return 'Pendiente';
    }

    return 'No aplica';
  }

  obtenerFechaLiquidacion(pago: Pago): string {
    const registro = this.liquidaciones[String(pago.id)];

    return registro?.fecha
      ? this.formatearFechaHoraReporte(registro.fecha)
      : '';
  }

  marcarLiquidado(pago: Pago): void {
    this.limpiarMensajes();

    if (pago.estado !== 'COMPLETADO') {
      this.error =
        'Solo se puede liquidar al propietario cuando el pago está completado.';
      return;
    }

    if (this.obtenerEstadoLiquidacion(pago) === 'LIQUIDADO') {
      this.error = 'Este pago ya se encuentra liquidado.';
      return;
    }

    const confirmar = window.confirm(
      `¿Confirmar liquidación al propietario?\n\n` +
      `Departamento: ${pago.departamento}\n` +
      `Propietario: DNI ${this.obtenerDniPropietario(pago.propietarioEmail)}\n` +
      `Neto a entregar: S/ ${this.calcularNetoPropietario(pago).toFixed(2)}\n\n` +
      `El pago quedará marcado como LIQUIDADO.`,
    );

    if (!confirmar) {
      return;
    }

    this.liquidaciones[String(pago.id)] = {
      estado: 'LIQUIDADO',
      fecha: new Date().toISOString(),
    };

    this.guardarLiquidaciones();

    this.mensaje =
      `Liquidación registrada correctamente por S/ ` +
      `${this.calcularNetoPropietario(pago).toFixed(2)}.`;
  }

  reabrirLiquidacion(pago: Pago): void {
    this.limpiarMensajes();

    if (this.obtenerEstadoLiquidacion(pago) !== 'LIQUIDADO') {
      return;
    }

    const confirmar = window.confirm(
      '¿Deseas volver a marcar esta liquidación como pendiente?',
    );

    if (!confirmar) {
      return;
    }

    delete this.liquidaciones[String(pago.id)];
    this.guardarLiquidaciones();

    this.mensaje = 'La liquidación volvió al estado Pendiente.';
  }

  // ============================================================
  // DETALLE DEL PAGO
  // ============================================================

  abrirDetallePago(pago: Pago): void {
    this.pagoSeleccionado = pago;
  }

  cerrarDetallePago(): void {
    this.pagoSeleccionado = null;
  }

  get reservaPagoSeleccionado(): Reserva | null {
    if (!this.pagoSeleccionado) {
      return null;
    }

    return (
      this.reservas.find(
        (reserva) =>
          Number(reserva.id) === Number(this.pagoSeleccionado?.reservaId),
      ) ?? null
    );
  }

  // ============================================================
  // EXPORTAR REPORTE A EXCEL
  // ============================================================

  exportarReporteExcel(): void {
    this.limpiarMensajes();

    if (this.rangoFechasReporteInvalido) {
      this.error =
        'La fecha "Desde" no puede ser posterior a la fecha "Hasta".';
      return;
    }

    const pagos = this.pagosFiltradosReporte;

    if (pagos.length === 0) {
      this.error =
        'No hay pagos que coincidan con los filtros seleccionados.';
      return;
    }

    const ahora = new Date();

    const resumen: (string | number)[][] = [
      ['DEPAYA - REPORTE FINANCIERO'],
      [],
      ['Generado', ahora.toLocaleString('es-PE')],
      ['Periodo', this.obtenerTextoPeriodoReporte()],
      ['Estado de pago', this.obtenerTextoFiltroEstado()],
      ['Método de pago', this.obtenerTextoFiltroMetodo()],
      ['Propietario', this.obtenerTextoFiltroPropietario()],
      [
        'Liquidación',
        this.estadoLiquidacionReporte || 'Todos los estados',
      ],
      ['Búsqueda', this.busquedaPago || 'Sin búsqueda'],
      [],
      ['INDICADORES'],
      ['Registros exportados', pagos.length],
      ['Pagos completados', this.totalPagosCompletadosReporte],
      ['Pagos procesados', this.totalIngresosReporte],
      ['Comisión DepaYa', this.totalComisionesDepaYaReporte],
      ['Neto a propietarios', this.totalNetoPropietariosReporte],
      ['Ticket promedio', this.ticketPromedioReporte],
      ['Método más usado', this.metodoMasUsadoReporte],
      ['Reembolsos pendientes', this.totalReembolsosPendientesReporte],
      ['Pagos reembolsados', this.totalReembolsadosReporte],
      ['Liquidaciones pendientes', this.totalPendientesLiquidarReporte],
      ['Monto pendiente de liquidar', this.montoPendienteLiquidarReporte],
      [],
      ['RESUMEN POR MÉTODO'],
      ['Método', 'Cantidad', 'Participación', 'Total completado'],
    ];

    this.resumenMetodosReporte.forEach((item) => {
      resumen.push([
        item.nombre,
        item.cantidad,
        item.porcentaje / 100,
        item.total,
      ]);
    });

    if (this.propietarioSeleccionadoResumen) {
      const propietario = this.propietarioSeleccionadoResumen;

      resumen.push(
        [],
        ['RESUMEN DEL PROPIETARIO'],
        ['Nombre', propietario.nombre],
        ['DNI', propietario.dni],
        ['Correo', propietario.email],
        ['Pagos completados', propietario.pagos],
        ['Ingresos brutos', propietario.bruto],
        ['Comisión DepaYa', propietario.comision],
        ['Neto propietario', propietario.neto],
        ['Pendiente de liquidar', propietario.pendienteLiquidar],
      );
    }

    const hojaResumen = XLSX.utils.aoa_to_sheet(resumen);

    hojaResumen['!cols'] = [
      { wch: 30 },
      { wch: 36 },
      { wch: 20 },
      { wch: 22 },
    ];

    const detalle = pagos.map((pago, index) => ({
      '#': index + 1,
      'Fecha': this.formatearFechaHoraReporte(pago.fecha),
      'Departamento': `${pago.departamento} | Reserva #${pago.reservaId}`,
      'Inquilino': `${pago.inquilinoNombre} | ${pago.inquilinoEmail}`,
      'Propietario':
        `DNI ${this.obtenerDniPropietario(pago.propietarioEmail)} | ` +
        `${pago.propietarioEmail}`,
      'Total': Number(pago.monto),
      'Comisión DepaYa': this.calcularComisionDepaYa(pago),
      'Neto propietario': this.calcularNetoPropietario(pago),
      'Método': this.obtenerMetodoPago(pago),
      'Estado': this.obtenerTextoPago(pago),
      'Liquidación': this.obtenerTextoLiquidacion(pago),
      'Fecha liquidación': this.obtenerFechaLiquidacion(pago),
    }));

    const hojaDetalle = XLSX.utils.json_to_sheet(detalle);

    hojaDetalle['!cols'] = [
      { wch: 7 },
      { wch: 22 },
      { wch: 48 },
      { wch: 48 },
      { wch: 48 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 22 },
      { wch: 20 },
      { wch: 22 },
    ];

    if (hojaDetalle['!ref']) {
      hojaDetalle['!autofilter'] = {
        ref: hojaDetalle['!ref'],
      };

      const rango = XLSX.utils.decode_range(hojaDetalle['!ref']);

      for (let fila = 1; fila <= rango.e.r; fila += 1) {
        [5, 6, 7].forEach((columna) => {
          const direccion = XLSX.utils.encode_cell({
            r: fila,
            c: columna,
          });

          if (hojaDetalle[direccion]) {
            hojaDetalle[direccion].z = '"S/ "0.00';
          }
        });
      }
    }

    const graficoData = this.graficoMensualReporte.map((punto) => ({
      'Mes': punto.etiqueta,
      'Ingresos': punto.total,
      'Comisión DepaYa': punto.comision,
      'Neto propietario': punto.neto,
    }));

    const hojaMensual = XLSX.utils.json_to_sheet(graficoData);

    hojaMensual['!cols'] = [
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 20 },
    ];

    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      libro,
      hojaDetalle,
      'Detalle de pagos',
    );

    XLSX.utils.book_append_sheet(
      libro,
      hojaResumen,
      'Resumen financiero',
    );

    XLSX.utils.book_append_sheet(
      libro,
      hojaMensual,
      'Evolución mensual',
    );

    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minuto = String(ahora.getMinutes()).padStart(2, '0');

    const sufijoPropietario = this.propietarioPagoReporte
      ? '_Propietario'
      : '';

    const nombreArchivo =
      `DepaYa_Reporte_Financiero${sufijoPropietario}_` +
      `${anio}-${mes}-${dia}_${hora}-${minuto}.xlsx`;

    XLSX.writeFile(
      libro,
      nombreArchivo,
      {
        compression: true,
      },
    );

    this.mensaje =
      `Reporte financiero exportado correctamente con ` +
      `${pagos.length} registro(s).`;
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

    delete this.liquidaciones[String(pago.id)];
    this.guardarLiquidaciones();

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
