import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Reserva, ReservaService } from '../../services/reserva.service';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,

  imports: [CommonModule],

  templateUrl: './mis-reservas.component.html',

  styleUrls: ['./mis-reservas.component.css'],
})
export class MisReservasComponent implements OnInit {
  reservas: Reserva[] = [];

  constructor(
    private reservaService: ReservaService,

    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuarioActual();

    if (!usuario) {
      return;
    }

    this.reservas = this.reservaService.buscarPorInquilino(usuario.email);
  }
}
