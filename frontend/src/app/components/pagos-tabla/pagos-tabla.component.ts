import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagos-tabla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagos-tabla.component.html',
  styleUrls: ['./pagos-tabla.component.css'],
})
export class PagosTablComponent {
  pagos = [
    { id: 1, idReserva: 1, monto: 1120.00, moneda: 'PEN', metodo: 'Tarjeta',       estado: 'Completado',  fecha: '15/06/2026' },
    { id: 2, idReserva: 2, monto:  600.00, moneda: 'PEN', metodo: 'Yape',          estado: 'Procesando',  fecha: '20/06/2026' },
    { id: 3, idReserva: 3, monto:  300.00, moneda: 'PEN', metodo: 'Tarjeta',       estado: 'Reembolsado', fecha: '25/06/2026' },
    { id: 4, idReserva: 4, monto: 3500.00, moneda: 'PEN', metodo: 'Transferencia', estado: 'Completado',  fecha: '01/07/2026' },
    { id: 5, idReserva: 5, monto:  840.00, moneda: 'PEN', metodo: 'Yape',          estado: 'Procesando',  fecha: '10/07/2026' },
    { id: 6, idReserva: 6, monto: 1500.00, moneda: 'PEN', metodo: 'Plin',          estado: 'Completado',  fecha: '18/07/2026' },
  ];

  metodos = ['Tarjeta', 'Yape', 'Plin', 'Transferencia', 'Efectivo'];
  estados = ['Completado', 'Procesando', 'Reembolsado'];
  monedas = ['PEN', 'USD'];

  modalVisible = false;
  modoEdicion = false;
  idEdicion: number | null = null;
  form: any = {};

  abrirCrear() {
    this.form = { idReserva: 0, monto: 0, moneda: 'PEN', metodo: 'Tarjeta', estado: 'Procesando', fecha: '' };
    this.modoEdicion = false;
    this.idEdicion = null;
    this.modalVisible = true;
  }

  abrirEditar(item: any) {
    this.form = { ...item };
    this.modoEdicion = true;
    this.idEdicion = item.id;
    this.modalVisible = true;
  }

  guardar() {
    if (this.modoEdicion) {
      const idx = this.pagos.findIndex(p => p.id === this.idEdicion);
      if (idx !== -1) this.pagos[idx] = { ...this.form, id: this.idEdicion! };
    } else {
      const nuevoId = Math.max(...this.pagos.map(p => p.id)) + 1;
      this.pagos = [...this.pagos, { ...this.form, id: nuevoId }];
    }
    this.cerrarModal();
  }

  eliminar(id: number) {
    this.pagos = this.pagos.filter(p => p.id !== id);
  }

  cerrarModal() {
    this.modalVisible = false;
    this.idEdicion = null;
  }
}
