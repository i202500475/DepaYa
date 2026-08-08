import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  credenciales = { email: '', password: '' };

  onLogin() {
    console.log('Datos de acceso:', this.credenciales);
    alert('¡Inicio de sesión exitoso!');
  }
}
