import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService, Usuario } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})
export class RegistroComponent {
  nombre = '';
  apellido = '';
  email = '';
  password = '';
  confirmarPassword = '';

  telefono = '';
  tipoDoc = 'DNI';
  nroDoc = '';

  // =====================================================
  // ROL
  // =====================================================

  rol: 'PROPIETARIO' | 'INQUILINO' = 'INQUILINO';

  mostrarPassword = false;
  mostrarConfirmarPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  // =====================================================
  // REGISTRAR
  // =====================================================

  registrar(): void {
    // ---------------------------------------------------
    // VALIDACIONES
    // ---------------------------------------------------

    if (!this.nombre.trim()) {
      alert('Ingrese su nombre.');
      return;
    }

    if (!this.apellido.trim()) {
      alert('Ingrese su apellido.');
      return;
    }

    if (!this.email.trim()) {
      alert('Ingrese su correo.');
      return;
    }

    if (!this.password) {
      alert('Ingrese una contraseña.');
      return;
    }

    if (this.password.length < 6) {
      alert('La contraseña debe tener mínimo 6 caracteres.');
      return;
    }

    if (this.password !== this.confirmarPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    if (!this.nroDoc.trim()) {
      alert('Ingrese su número de documento.');
      return;
    }

    // ---------------------------------------------------
    // VALIDAR ROL
    // ---------------------------------------------------

    if (this.rol !== 'PROPIETARIO' && this.rol !== 'INQUILINO') {
      alert('Seleccione un rol válido.');
      return;
    }

    // ---------------------------------------------------
    // CREAR USUARIO
    // ---------------------------------------------------

    const nuevoUsuario: Usuario = {
      nombre: this.nombre.trim(),

      apellido: this.apellido.trim(),

      email: this.email.trim().toLowerCase(),

      password: this.password,

      telefono: this.telefono.trim(),

      tipoDoc: this.tipoDoc,

      nroDoc: this.nroDoc.trim(),

      rol: this.rol,

      fecha: new Date().toLocaleDateString('es-PE'),
    };

    // ---------------------------------------------------
    // MOSTRAR EN CONSOLA PARA COMPROBAR
    // ---------------------------------------------------

    console.log('====================================');
    console.log('USUARIO A REGISTRAR');
    console.log('Nombre:', nuevoUsuario.nombre);
    console.log('Correo:', nuevoUsuario.email);
    console.log('Rol:', nuevoUsuario.rol);
    console.log('====================================');

    // ---------------------------------------------------
    // GUARDAR
    // ---------------------------------------------------

    const registrado = this.authService.registrar(nuevoUsuario);

    if (!registrado) {
      alert('Ya existe un usuario registrado con ese correo.');

      return;
    }

    // ---------------------------------------------------
    // MENSAJE
    // ---------------------------------------------------

    const nombreRol = this.rol === 'PROPIETARIO' ? 'Propietario' : 'Inquilino';

    alert(`Registro exitoso como ${nombreRol}. Ahora puedes iniciar sesión.`);

    // ---------------------------------------------------
    // IR AL LOGIN
    // ---------------------------------------------------

    this.router.navigate(['/login']);
  }

  // =====================================================
  // IR AL LOGIN
  // =====================================================

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  // =====================================================
  // MOSTRAR PASSWORD
  // =====================================================

  alternarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  // =====================================================
  // MOSTRAR CONFIRMAR PASSWORD
  // =====================================================

  alternarConfirmarPassword(): void {
    this.mostrarConfirmarPassword = !this.mostrarConfirmarPassword;
  }
}
