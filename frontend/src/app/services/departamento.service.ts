import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DepartamentoService {
  private departamentos = [
    {
      Titulo: 'Loft Ejecutivo Prime con Vista al Mar',
      Distrito: 'Miraflores',
      Precio_Noche: 280.0,
      Habitaciones: 2,
      Banos: 2,
      URL_Imagen:
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
  ];

  getDepartamentos() {
    return this.departamentos;
  }
}
