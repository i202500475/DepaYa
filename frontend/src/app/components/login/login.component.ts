import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';

  mostrarPassword = false;
  cargando = false;

  mensaje = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  // ==========================================
  // INICIAR SESIÓN
  // ==========================================

  iniciarSesion(): void {
    this.mensaje = '';

    // ------------------------------------------
    // VALIDAR CORREO
    // ------------------------------------------

    if (!this.email.trim()) {
      this.mensaje = 'Ingrese su correo.';

      return;
    }

    // ------------------------------------------
    // VALIDAR PASSWORD
    // ------------------------------------------

    if (!this.password) {
      this.mensaje = 'Ingrese su contraseña.';

      return;
    }

    this.cargando = true;

    // ------------------------------------------
    // LOGIN
    // ------------------------------------------

    const usuario = this.authService.login(this.email, this.password);

    this.cargando = false;

    // ------------------------------------------
    // LOGIN INCORRECTO
    // ------------------------------------------

    if (!usuario) {
      this.mensaje = 'Correo o contraseña incorrectos.';

      return;
    }

    // ------------------------------------------
    // MOSTRAR EN CONSOLA
    // ------------------------------------------

    console.log('Usuario conectado:', usuario);

    console.log('Rol:', usuario.rol);

    // ==========================================
    // ADMIN
    // ==========================================

    if (usuario.rol === 'ADMIN') {
      console.log('🔴 ADMIN DETECTADO');
      console.log('➡️ Navegando a /admin');

      this.router.navigate(['/admin']).then((resultado) => {
        console.log('Resultado navegación:', resultado);
        console.log('URL actual:', this.router.url);
      });

      return;
    }

    // ==========================================
    // PROPIETARIO
    // ==========================================

    if (usuario.rol === 'PROPIETARIO') {
      this.router.navigate(['/propietario']);

      return;
    }

    // ==========================================
    // INQUILINO
    // ==========================================

    if (usuario.rol === 'INQUILINO') {
      this.router.navigate(['/explorar']);

      return;
    }

    // ==========================================
    // ROL DESCONOCIDO
    // ==========================================

    this.mensaje = 'El usuario no tiene un rol válido.';

    this.authService.cerrarSesion();
  }

  // ==========================================
  // MOSTRAR / OCULTAR PASSWORD
  // ==========================================

  alternarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  // ==========================================
  // IR A REGISTRO
  // ==========================================

  irARegistro(): void {
    this.router.navigate(['/registro']);
  }

  // ==========================================
  // RECUPERAR PASSWORD
  // ==========================================

  recuperarPassword(): void {
    alert('La recuperación de contraseña estará disponible próximamente.');
  }
}
