import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService, Usuario } from '../../services/auth.service';

@Component({
  selector: 'app-usuarios-tabla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios-tabla.component.html',
  styleUrls: ['./usuarios-tabla.component.css'],
})
export class UsuariosTablComponent implements OnInit {
  // ==========================================
  // LISTA DE USUARIOS
  // ==========================================

  usuarios: any[] = [];

  roles = ['Propietario', 'Inquilino', 'Administrador'];

  tiposDocs = ['DNI', 'Pasaporte', 'CE'];

  // ==========================================
  // MODAL
  // ==========================================

  modalVisible = false;

  modoEdicion = false;

  idEdicion: number | null = null;

  form: any = {};

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(private authService: AuthService) {}

  // ==========================================
  // INICIO
  // ==========================================

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // ==========================================
  // CARGAR USUARIOS
  // ==========================================

  cargarUsuarios(): void {
    const usuarios = this.authService.listarUsuarios();

    this.usuarios = usuarios.map((u, index) => {
      let rolMostrar = '';

      if (u.rol === 'ADMIN') {
        rolMostrar = 'Administrador';
      }

      if (u.rol === 'PROPIETARIO') {
        rolMostrar = 'Propietario';
      }

      if (u.rol === 'INQUILINO') {
        rolMostrar = 'Inquilino';
      }

      return {
        ...u,

        // El número de la tabla siempre será consecutivo
        numero: index + 1,

        nombre: u.nombre || '',
        apellido: u.apellido || '',
        correo: u.email || '',
        telefono: u.telefono || '',
        tipoDoc: u.tipoDoc || 'DNI',
        nroDoc: u.nroDoc || '',
        rol: rolMostrar,
        fecha: u.fecha || '',
      };
    });
  }

  // ==========================================
  // NUEVO USUARIO
  // ==========================================

  abrirCrear(): void {
    this.form = {
      nombre: '',

      apellido: '',

      correo: '',

      email: '',

      password: '123456',

      telefono: '',

      tipoDoc: 'DNI',

      nroDoc: '',

      rol: 'Inquilino',

      fecha: new Date().toLocaleDateString('es-PE'),
    };

    this.modoEdicion = false;

    this.idEdicion = null;

    this.modalVisible = true;
  }

  // ==========================================
  // EDITAR USUARIO
  // ==========================================

  abrirEditar(usuario: any): void {
    this.form = {
      ...usuario,

      email: usuario.email || usuario.correo,

      correo: usuario.correo || usuario.email,

      password: usuario.password || '123456',

      rol: usuario.rol,
    };

    this.modoEdicion = true;

    this.idEdicion = usuario.id;

    this.modalVisible = true;
  }

  // ==========================================
  // GUARDAR
  // ==========================================

  guardar(): void {
    // ------------------------------------------
    // VALIDACIONES
    // ------------------------------------------

    if (!this.form.nombre || !this.form.nombre.trim()) {
      alert('Ingrese el nombre del usuario.');

      return;
    }

    if (!this.form.correo || !this.form.correo.trim()) {
      alert('Ingrese el correo del usuario.');

      return;
    }

    // ------------------------------------------
    // CONVERTIR ROL DE LA TABLA
    // A ROL DEL SISTEMA
    // ------------------------------------------

    let rolSistema: 'ADMIN' | 'PROPIETARIO' | 'INQUILINO';

    if (this.form.rol === 'Administrador') {
      rolSistema = 'ADMIN';
    } else if (this.form.rol === 'Propietario') {
      rolSistema = 'PROPIETARIO';
    } else {
      rolSistema = 'INQUILINO';
    }

    // ------------------------------------------
    // EDITAR
    // ------------------------------------------

    if (this.modoEdicion) {
      if (!this.idEdicion) {
        alert('No se encontró el usuario.');

        return;
      }

      const usuarioActualizado: Usuario = {
        id: this.idEdicion,

        nombre: this.form.nombre,

        apellido: this.form.apellido || '',

        email: this.form.correo.trim(),

        password: this.form.password || '123456',

        telefono: this.form.telefono || '',

        tipoDoc: this.form.tipoDoc || 'DNI',

        nroDoc: this.form.nroDoc || '',

        rol: rolSistema,

        fecha: this.form.fecha || new Date().toLocaleDateString('es-PE'),
      };

      const actualizado = this.authService.actualizarUsuario(usuarioActualizado);

      if (!actualizado) {
        alert('No se pudo actualizar el usuario.');

        return;
      }

      alert('Usuario actualizado correctamente.');
    }

    // ------------------------------------------
    // NUEVO
    // ------------------------------------------
    else {
      const nuevoUsuario: Usuario = {
        nombre: this.form.nombre,

        apellido: this.form.apellido || '',

        email: this.form.correo.trim(),

        password: this.form.password || '123456',

        telefono: this.form.telefono || '',

        tipoDoc: this.form.tipoDoc || 'DNI',

        nroDoc: this.form.nroDoc || '',

        rol: rolSistema,

        fecha: new Date().toLocaleDateString('es-PE'),
      };

      const registrado = this.authService.registrar(nuevoUsuario);

      if (!registrado) {
        alert('Ya existe un usuario con ese correo.');

        return;
      }

      alert('Usuario registrado correctamente.');
    }

    // ------------------------------------------
    // VOLVER A CARGAR DESDE LOCALSTORAGE
    // ------------------------------------------

    this.cargarUsuarios();

    this.cerrarModal();
  }

  // ==========================================
  // ELIMINAR
  // ==========================================

  eliminar(id: number): void {
    const usuario = this.usuarios.find((u) => u.id === id);

    if (!usuario) {
      alert('Usuario no encontrado.');

      return;
    }

    const confirmar = confirm(
      `¿Seguro que deseas eliminar a ${usuario.nombre} ${usuario.apellido}?`,
    );

    if (!confirmar) {
      return;
    }

    const eliminado = this.authService.eliminarUsuario(id);

    if (!eliminado) {
      alert('No se pudo eliminar el usuario.');

      return;
    }

    // Volver a cargar desde localStorage
    this.cargarUsuarios();

    alert('Usuario eliminado correctamente.');
  }

  // ==========================================
  // CERRAR MODAL
  // ==========================================

  cerrarModal(): void {
    this.modalVisible = false;

    this.idEdicion = null;

    this.form = {};
  }
}
