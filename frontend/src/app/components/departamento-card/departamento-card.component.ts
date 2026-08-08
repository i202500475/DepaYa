// @ts-ignore
import { Component, Input } from '@angular/core';
// @ts-ignore
import { CommonModule } from '@angular/common';

// @ts-ignore
@Component({
  selector: 'app-departamento-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './departamento-card.component.html',
  styleUrls: ['./departamento-card.component.css']
})
export class DepartamentoCardComponent {

  @Input() departamento: any = {
    Titulo: 'Loft Ejecutivo Prime con Vista al Mar',
    Distrito: 'Miraflores',
    Precio_Noche: 280.00,
    Habitaciones: 2,
    Banos: 2,
    URL_Imagen: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  };

}
