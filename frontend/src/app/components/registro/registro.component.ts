import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})
export class RegistroComponent {
  usuario = { nombre: '', email: '', password: '' };

  onRegistro() {
    console.log('Registrando usuario:', this.usuario);
    alert('¡Cuenta creada con éxito en DepaYa!');
  }
}
