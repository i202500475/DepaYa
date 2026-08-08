import { Component } from '@angular/core';

/**
 * Componente Navbar
 * Gestiona la navegación principal de la plataforma DepaYa.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isLogged: boolean = false;
}
