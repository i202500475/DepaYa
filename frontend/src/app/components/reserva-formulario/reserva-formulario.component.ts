import { Component } from '@angular/core';

/**
 * Componente Widget de Reserva
 * Formulario interactivo para registrar una nueva reserva.
 */
@Component({
  selector: 'app-reserva-formulario',
  standalone: true,
  templateUrl: './reserva-formulario.component.html',
  styleUrls: ['./reserva-formulario.component.css']
})
export class ReservaFormularioComponent {
  procesarReserva() {
    alert('¡Reserva confirmada! Redirigiendo a pasarela de pagos...');
  }
}
