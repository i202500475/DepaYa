import { Injectable } from '@angular/core';

export type RolUsuario = 'ADMIN' | 'PROPIETARIO' | 'INQUILINO';

export interface Usuario {
  id?: number;
  nombre: string;
  apellido?: string;
  email: string;
  password: string;
  telefono?: string;
  tipoDoc?: string;
  nroDoc?: string;
  rol: RolUsuario;
  fecha?: string;

  // Estado lógico de la cuenta. Los registros antiguos se consideran activos.
  Activo?: boolean;

  // Si es false, el propietario conserva acceso a reservas/pagos,
  // pero no puede crear nuevas publicaciones hasta que ADMIN lo reactive.
  PublicacionesHabilitadas?: boolean;

  fechaDesactivacion?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'usuariosDepaYa';

  private readonly CURRENT_USER_KEY = 'usuarioActual';

  private usuarios: Usuario[] = [];

  constructor() {
    this.cargarUsuarios();
  }

  // ============================================================
  // CARGAR USUARIOS
  // ============================================================

  private cargarUsuarios(): void {
    const datos = localStorage.getItem(this.STORAGE_KEY);

    // Si nunca hubo usuarios,
    // crear solamente los usuarios iniciales.
    if (!datos) {
      this.crearUsuariosIniciales();

      return;
    }

    try {
      const usuariosGuardados: any[] = JSON.parse(datos);

      if (!Array.isArray(usuariosGuardados)) {
        this.usuarios = [];

        this.crearUsuariosIniciales();

        return;
      }

      // ========================================================
      // NORMALIZAR USUARIOS ANTIGUOS
      // ========================================================

      this.usuarios = usuariosGuardados.map((usuario: any, index: number) => {
        return {
          id: usuario.id ?? usuario.iD_Usuario ?? index + 1,

          nombre: usuario.nombre?.trim() || 'Usuario',

          apellido: usuario.apellido?.trim() || '',

          email: (usuario.email || usuario.correo || '').trim().toLowerCase(),

          // Si un usuario viejo no tenía
          // contraseña, podrá entrar con 123456
          password: usuario.password || usuario.contrasena || usuario.contraseña || '123456',

          telefono: usuario.telefono || '',

          tipoDoc: usuario.tipoDoc || usuario.tipo_Documento || 'DNI',

          nroDoc: usuario.nroDoc || usuario.numero_Documento || '',

          rol: this.normalizarRol(usuario.rol),

          fecha: usuario.fecha || usuario.fecha_Registro || new Date().toLocaleDateString('es-PE'),

          Activo: usuario.Activo !== false && usuario.activo !== false,

          PublicacionesHabilitadas:
            usuario.PublicacionesHabilitadas !== false &&
            usuario.publicacionesHabilitadas !== false,

          fechaDesactivacion:
            usuario.fechaDesactivacion || '',
        };
      });

      // Quitar registros inválidos
      this.usuarios = this.usuarios.filter((usuario) => usuario.email !== '');

      this.verificarIds();

      this.verificarAdministrador();

      // Guardar ya normalizados
      this.guardarUsuarios();
    } catch (error) {
      console.error('Error al cargar usuarios:', error);

      this.usuarios = [];

      this.crearUsuariosIniciales();
    }
  }

  // ============================================================
  // USUARIOS INICIALES
  // ============================================================

  private crearUsuariosIniciales(): void {
    this.usuarios = [
      {
        id: 1,

        nombre: 'Administrador',

        apellido: '',

        email: 'admin@depaya.com',

        password: '123456',

        telefono: '',

        tipoDoc: 'DNI',

        nroDoc: '',

        rol: 'ADMIN',

        fecha: new Date().toLocaleDateString('es-PE'),

        Activo: true,

        PublicacionesHabilitadas: true,

        fechaDesactivacion: '',
      },

      {
        id: 2,

        nombre: 'Propietario Demo',

        apellido: '',

        email: 'propietario@depaya.com',

        password: '123456',

        telefono: '',

        tipoDoc: 'DNI',

        nroDoc: '',

        rol: 'PROPIETARIO',

        fecha: new Date().toLocaleDateString('es-PE'),

        Activo: true,

        PublicacionesHabilitadas: true,

        fechaDesactivacion: '',
      },

      {
        id: 3,

        nombre: 'Inquilino Demo',

        apellido: '',

        email: 'inquilino@depaya.com',

        password: '123456',

        telefono: '',

        tipoDoc: 'DNI',

        nroDoc: '',

        rol: 'INQUILINO',

        fecha: new Date().toLocaleDateString('es-PE'),

        Activo: true,

        PublicacionesHabilitadas: true,

        fechaDesactivacion: '',
      },
    ];

    this.guardarUsuarios();
  }

  // ============================================================
  // NORMALIZAR ROL
  // ============================================================

  private normalizarRol(rol: any): RolUsuario {
    const valor = String(rol || '')
      .trim()
      .toUpperCase();

    if (valor === 'ADMIN' || valor === 'ADMINISTRADOR') {
      return 'ADMIN';
    }

    if (valor === 'PROPIETARIO') {
      return 'PROPIETARIO';
    }

    if (valor === 'INQUILINO') {
      return 'INQUILINO';
    }

    return 'INQUILINO';
  }

  // ============================================================
  // VERIFICAR IDS
  // ============================================================

  private verificarIds(): void {
    const idsUsados = new Set<number>();

    let siguienteId = 1;

    this.usuarios = this.usuarios.map((usuario) => {
      let id = Number(usuario.id);

      if (!id || idsUsados.has(id)) {
        while (idsUsados.has(siguienteId)) {
          siguienteId++;
        }

        id = siguienteId;
      }

      idsUsados.add(id);

      siguienteId = Math.max(siguienteId, id + 1);

      return {
        ...usuario,
        id,
      };
    });
  }

  // ============================================================
  // VERIFICAR ADMINISTRADOR
  // ============================================================

  private verificarAdministrador(): void {
    const adminExiste = this.usuarios.some(
      (usuario) =>
        usuario.email.trim().toLowerCase() === 'admin@depaya.com' && usuario.rol === 'ADMIN',
    );

    if (adminExiste) {
      return;
    }

    const adminPorCorreo = this.usuarios.find(
      (usuario) => usuario.email.trim().toLowerCase() === 'admin@depaya.com',
    );

    // Si existe el correo pero perdió el rol,
    // restaurar ADMIN sin borrar sus datos.
    if (adminPorCorreo) {
      adminPorCorreo.rol = 'ADMIN';

      if (!adminPorCorreo.password) {
        adminPorCorreo.password = '123456';
      }

      this.guardarUsuarios();

      return;
    }

    // Si no existe, recién crear.
    this.usuarios.push({
      id: this.obtenerSiguienteId(),

      nombre: 'Administrador',

      apellido: '',

      email: 'admin@depaya.com',

      password: '123456',

      telefono: '',

      tipoDoc: 'DNI',

      nroDoc: '',

      rol: 'ADMIN',

      fecha: new Date().toLocaleDateString('es-PE'),

      Activo: true,

      PublicacionesHabilitadas: true,

      fechaDesactivacion: '',
    });

    this.guardarUsuarios();
  }

  // ============================================================
  // GUARDAR
  // ============================================================

  private guardarUsuarios(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.usuarios));
  }

  // ============================================================
  // REFRESCAR DESDE LOCALSTORAGE
  // ============================================================

  private refrescarUsuarios(): void {
    const datos = localStorage.getItem(this.STORAGE_KEY);

    if (!datos) {
      return;
    }

    try {
      const usuariosGuardados: Usuario[] = JSON.parse(datos);

      if (Array.isArray(usuariosGuardados)) {
        this.usuarios = usuariosGuardados;
      }
    } catch (error) {
      console.error('Error refrescando usuarios:', error);
    }
  }

  // ============================================================
  // LISTAR
  // ============================================================

  listarUsuarios(): Usuario[] {
    this.refrescarUsuarios();

    return this.usuarios.map((usuario) => ({
      ...usuario,
    }));
  }

  // ============================================================
  // BUSCAR POR ID
  // ============================================================

  obtenerUsuarioPorId(id: number): Usuario | null {
    this.refrescarUsuarios();

    const usuario = this.usuarios.find((usuario) => usuario.id === id);

    return usuario ? { ...usuario } : null;
  }

  // ============================================================
  // BUSCAR POR EMAIL
  // ============================================================

  obtenerUsuarioPorEmail(email: string): Usuario | null {
    this.refrescarUsuarios();

    const correo = email.trim().toLowerCase();

    const usuario = this.usuarios.find((usuario) => usuario.email.trim().toLowerCase() === correo);

    return usuario ? { ...usuario } : null;
  }

  // ============================================================
  // REGISTRAR
  // ============================================================

  registrar(usuario: Usuario): boolean {
    this.refrescarUsuarios();

    const email = usuario.email.trim().toLowerCase();

    if (!email) {
      return false;
    }

    const existe = this.usuarios.some(
      (usuarioExistente) => usuarioExistente.email.trim().toLowerCase() === email,
    );

    if (existe) {
      return false;
    }

    const nuevoUsuario: Usuario = {
      ...usuario,

      id: this.obtenerSiguienteId(),

      nombre: usuario.nombre.trim(),

      apellido: usuario.apellido?.trim() || '',

      email,

      // Usuario creado desde ADMIN
      // podrá entrar con esta contraseña.
      password: usuario.password || '123456',

      telefono: usuario.telefono?.trim() || '',

      tipoDoc: usuario.tipoDoc || 'DNI',

      nroDoc: usuario.nroDoc?.trim() || '',

      rol: this.normalizarRol(usuario.rol),

      fecha: usuario.fecha || new Date().toLocaleDateString('es-PE'),

      Activo: usuario.Activo !== false,

      PublicacionesHabilitadas:
        usuario.PublicacionesHabilitadas !== false,

      fechaDesactivacion:
        usuario.fechaDesactivacion || '',
    };

    this.usuarios.push(nuevoUsuario);

    this.guardarUsuarios();

    return true;
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  actualizarUsuario(usuario: Usuario): boolean {
    this.refrescarUsuarios();

    if (usuario.id == null) {
      return false;
    }

    const indice = this.usuarios.findIndex((existente) => existente.id === usuario.id);

    if (indice === -1) {
      return false;
    }

    const email = usuario.email.trim().toLowerCase();

    const correoDuplicado = this.usuarios.some(
      (existente) => existente.id !== usuario.id && existente.email.trim().toLowerCase() === email,
    );

    if (correoDuplicado) {
      return false;
    }

    const original = this.usuarios[indice];

    // Proteger ADMIN principal
    if (original.email.trim().toLowerCase() === 'admin@depaya.com') {
      usuario.email = 'admin@depaya.com';

      usuario.rol = 'ADMIN';
    }

    this.usuarios[indice] = {
      ...original,

      ...usuario,

      id: original.id,

      nombre: usuario.nombre.trim(),

      apellido: usuario.apellido?.trim() || '',

      email: usuario.email.trim().toLowerCase(),

      password: usuario.password || original.password || '123456',

      telefono: usuario.telefono?.trim() || '',

      tipoDoc: usuario.tipoDoc || 'DNI',

      nroDoc: usuario.nroDoc?.trim() || '',

      rol: this.normalizarRol(usuario.rol),

      fecha: original.fecha || usuario.fecha || new Date().toLocaleDateString('es-PE'),
    };

    this.guardarUsuarios();

    // Si está editando al usuario
    // actualmente conectado
    const actual = this.obtenerUsuarioActual();

    if (actual?.id === usuario.id) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(this.usuarios[indice]));
    }

    return true;
  }

  // ============================================================
  // ELIMINAR
  // ============================================================

  eliminarUsuario(id: number): boolean {
    this.refrescarUsuarios();

    const usuario = this.usuarios.find((usuario) => usuario.id === id);

    if (!usuario) {
      return false;
    }

    if (usuario.email.trim().toLowerCase() === 'admin@depaya.com') {
      return false;
    }

    const cantidadAnterior = this.usuarios.length;

    this.usuarios = this.usuarios.filter((usuario) => usuario.id !== id);

    const eliminado = this.usuarios.length < cantidadAnterior;

    if (eliminado) {
      this.guardarUsuarios();
    }

    return eliminado;
  }

  // ============================================================
  // LOGIN
  // ============================================================

  login(email: string, password: string): Usuario | null {
    // IMPORTANTE:
    // Leer nuevamente el localStorage
    // antes de cada login para reconocer
    // usuarios recién creados.
    this.refrescarUsuarios();

    const correo = email.trim().toLowerCase();

    const clave = password.trim();

    const usuario = this.usuarios.find(
      (usuario) => usuario.email.trim().toLowerCase() === correo && usuario.password === clave,
    );

    if (!usuario) {
      console.warn('Login rechazado:', correo);

      return null;
    }

    if (usuario.Activo === false) {
      console.warn('Cuenta desactivada:', correo);

      return null;
    }

    const usuarioActual: Usuario = {
      ...usuario,

      rol: this.normalizarRol(usuario.rol),
    };

    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(usuarioActual));

    return usuarioActual;
  }

  // ============================================================
  // USUARIO ACTUAL
  // ============================================================

  obtenerUsuarioActual(): Usuario | null {
    const datos = localStorage.getItem(this.CURRENT_USER_KEY);

    if (!datos) {
      return null;
    }

    try {
      const usuario: Usuario = JSON.parse(datos);

      if (!usuario || !usuario.email || !usuario.rol) {
        localStorage.removeItem(this.CURRENT_USER_KEY);

        return null;
      }

      return {
        ...usuario,

        rol: this.normalizarRol(usuario.rol),
      };
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);

      localStorage.removeItem(this.CURRENT_USER_KEY);

      return null;
    }
  }

  // ============================================================
  // ROL ACTUAL
  // ============================================================

  obtenerRolActual(): RolUsuario | null {
    const usuario = this.obtenerUsuarioActual();

    return usuario?.rol ?? null;
  }

  // ============================================================
  // VERIFICAR ROL
  // ============================================================

  tieneRol(rol: RolUsuario): boolean {
    return this.obtenerRolActual() === rol;
  }

  // ============================================================
  // LOGUEADO
  // ============================================================

  estaLogueado(): boolean {
    return this.obtenerUsuarioActual() !== null;
  }

  // ============================================================
  // BLOQUEAR PUBLICACIONES DEL PROPIETARIO
  // ============================================================

  bloquearPublicacionesPropietario(id: number): boolean {
    this.refrescarUsuarios();

    const indice = this.usuarios.findIndex((usuario) => usuario.id === id);

    if (indice === -1) {
      return false;
    }

    if (this.usuarios[indice].rol !== 'PROPIETARIO') {
      return false;
    }

    this.usuarios[indice] = {
      ...this.usuarios[indice],
      PublicacionesHabilitadas: false,
    };

    this.guardarUsuarios();
    this.sincronizarUsuarioActual(this.usuarios[indice]);

    return true;
  }

  // ============================================================
  // DESACTIVAR CUENTA DEL USUARIO
  // La cuenta NO se borra físicamente para permitir que ADMIN
  // pueda reactivarla posteriormente.
  // ============================================================

  desactivarCuenta(id: number): boolean {
    this.refrescarUsuarios();

    const indice = this.usuarios.findIndex((usuario) => usuario.id === id);

    if (indice === -1) {
      return false;
    }

    const usuario = this.usuarios[indice];

    if (usuario.email.trim().toLowerCase() === 'admin@depaya.com') {
      return false;
    }

    this.usuarios[indice] = {
      ...usuario,
      Activo: false,
      PublicacionesHabilitadas:
        usuario.rol === 'PROPIETARIO'
          ? false
          : usuario.PublicacionesHabilitadas !== false,
      fechaDesactivacion: new Date().toISOString(),
    };

    this.guardarUsuarios();

    const actual = this.obtenerUsuarioActual();

    if (actual?.id === id) {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }

    return true;
  }

  // ============================================================
  // REACTIVAR USUARIO - USO ADMIN
  // ============================================================

  reactivarUsuario(id: number): boolean {
    this.refrescarUsuarios();

    const indice = this.usuarios.findIndex((usuario) => usuario.id === id);

    if (indice === -1) {
      return false;
    }

    this.usuarios[indice] = {
      ...this.usuarios[indice],
      Activo: true,
      PublicacionesHabilitadas: true,
      fechaDesactivacion: '',
    };

    this.guardarUsuarios();

    return true;
  }

  // ============================================================
  // ESTADO DE PUBLICACIÓN
  // ============================================================

  puedePublicar(email: string): boolean {
    const usuario = this.obtenerUsuarioPorEmail(email);

    if (!usuario || usuario.Activo === false) {
      return false;
    }

    if (usuario.rol !== 'PROPIETARIO') {
      return false;
    }

    return usuario.PublicacionesHabilitadas !== false;
  }

  // ============================================================
  // SINCRONIZAR USUARIO ACTUAL
  // ============================================================

  private sincronizarUsuarioActual(usuario: Usuario): void {
    const actual = this.obtenerUsuarioActual();

    if (actual?.id === usuario.id) {
      localStorage.setItem(
        this.CURRENT_USER_KEY,
        JSON.stringify(usuario),
      );
    }
  }

  // ============================================================
  // CERRAR SESIÓN
  // ============================================================

  cerrarSesion(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  // ============================================================
  // SIGUIENTE ID
  // ============================================================

  private obtenerSiguienteId(): number {
    if (this.usuarios.length === 0) {
      return 1;
    }

    return Math.max(...this.usuarios.map((usuario) => usuario.id ?? 0)) + 1;
  }
}
