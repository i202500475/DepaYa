import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Departamento, DepartamentoService } from '../../services/departamento.service';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mis-departamentos',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './mis-departamentos.component.html',

  styleUrls: ['./mis-departamentos.component.css'],
})
export class MisDepartamentosComponent implements OnInit {
  departamentos: Departamento[] = [];

  propietarioEmail = '';

  constructor(
    private departamentoService: DepartamentoService,

    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const usuario = this.authService.obtenerUsuarioActual();

    if (!usuario || usuario.rol !== 'PROPIETARIO') {
      this.departamentos = [];

      return;
    }

    this.propietarioEmail = usuario.email.trim().toLowerCase();

    this.departamentos = this.departamentoService
      .getDepartamentosPorPropietario(this.propietarioEmail)
      .sort((a, b) => {
        const fechaA = a.fechaPublicacion ? new Date(a.fechaPublicacion).getTime() : 0;

        const fechaB = b.fechaPublicacion ? new Date(b.fechaPublicacion).getTime() : 0;

        return fechaB - fechaA;
      });
  }
}
