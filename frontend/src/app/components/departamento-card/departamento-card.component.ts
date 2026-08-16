import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-departamento-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './departamento-card.component.html',
  styleUrls: ['./departamento-card.component.css'],
})
export class DepartamentoCardComponent implements OnInit, OnChanges {
  @Input() departamento: any;

  favorito = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarEstadoFavorito();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['departamento']) {
      this.cargarEstadoFavorito();
    }
  }

  // ============================================================
  // FAVORITOS
  // ============================================================

  private obtenerClaveFavoritos(): string {
    const usuario = this.authService.obtenerUsuarioActual();
    const identificador = usuario?.email?.trim().toLowerCase() || 'invitado';

    return `favoritosDepaYa:${identificador}`;
  }

  private obtenerFavoritosGuardados(): number[] {
    try {
      const datos = localStorage.getItem(this.obtenerClaveFavoritos());

      if (!datos) {
        return [];
      }

      const lista = JSON.parse(datos);

      if (!Array.isArray(lista)) {
        return [];
      }

      return lista.map((id) => Number(id)).filter((id) => Number.isFinite(id));
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      return [];
    }
  }

  private cargarEstadoFavorito(): void {
    const id = Number(this.departamento?.id);

    if (!Number.isFinite(id)) {
      this.favorito = false;
      return;
    }

    this.favorito = this.obtenerFavoritosGuardados().includes(id);
  }

  alternarFavorito(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const id = Number(this.departamento?.id);

    if (!Number.isFinite(id)) {
      return;
    }

    const favoritos = this.obtenerFavoritosGuardados();
    const existe = favoritos.includes(id);

    const actualizados = existe
      ? favoritos.filter((favoritoId) => favoritoId !== id)
      : [...favoritos, id];

    localStorage.setItem(this.obtenerClaveFavoritos(), JSON.stringify(actualizados));

    this.favorito = !existe;
  }

  // ============================================================
  // SERVICIOS
  // ============================================================

  get tieneServicios(): boolean {
    return Boolean(
      this.departamento?.TienePiscina ||
      this.departamento?.TieneWifi ||
      this.departamento?.AdmiteMascotas,
    );
  }
}
