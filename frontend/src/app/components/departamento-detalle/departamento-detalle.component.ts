import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-departamento-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './departamento-detalle.component.html',
  styleUrls: ['./departamento-detalle.component.css'],
})
export class DepartamentoDetalleComponent {
  @Input() departamento: any = {
    Titulo: 'Loft Ejecutivo Prime con Vista al Mar',
    Distrito: 'Miraflores',
    Precio_Noche: 280.0,
    Habitaciones: 2,
    Banos: 2,
    URL_Imagen:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    Descripcion:
      'Hermoso loft moderno ubicado en zona exclusiva, totalmente amoblado y con vista panorámica al mar. Ideal para ejecutivos y parejas.',
  };
}
