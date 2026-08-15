import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reservas-tabla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas-tabla.component.html',
  styleUrls: ['./reservas-tabla.component.css'],
})
export class ReservasTablComponent {
  reservas = [
    { id: 1, idDepa: 1, idInquilino: 2, ingreso: '01/07/2026', salida: '05/07/2026', huespedes: 2, estado: 'Confirmada', creacion: '15/06/2026' },
    { id: 2, idDepa: 3, idInquilino: 3, ingreso: '10/07/2026', salida: '14/07/2026', huespedes: 3, estado: 'Pendiente',  creacion: '20/06/2026' },
    { id: 3, idDepa: 2, idInquilino: 5, ingreso: '20/07/2026', salida: '22/07/2026', huespedes: 1, estado: 'Cancelada',  creacion: '25/06/2026' },
    { id: 4, idDepa: 4, idInquilino: 2, ingreso: '01/08/2026', salida: '07/08/2026', huespedes: 4, estado: 'Confirmada', creacion: '01/07/2026' },
    { id: 5, idDepa: 1, idInquilino: 3, ingreso: '15/08/2026', salida: '18/08/2026', huespedes: 2, estado: 'Pendiente',  creacion: '10/07/2026' },
    { id: 6, idDepa: 6, idInquilino: 5, ingreso: '20/08/2026', salida: '25/08/2026', huespedes: 3, estado: 'Confirmada', creacion: '15/07/2026' },
  ];

  estados = ['Confirmada', 'Pendiente', 'Cancelada'];

  modalVisible = false;
  modoEdicion = false;
  idEdicion: number | null = null;
  form: any = {};

  abrirCrear() {
    this.form = { idDepa: 0, idInquilino: 0, ingreso: '', salida: '', huespedes: 1, estado: 'Pendiente', creacion: '' };
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
      const idx = this.reservas.findIndex(r => r.id === this.idEdicion);
      if (idx !== -1) this.reservas[idx] = { ...this.form, id: this.idEdicion! };
    } else {
      const nuevoId = Math.max(...this.reservas.map(r => r.id)) + 1;
      this.reservas = [...this.reservas, { ...this.form, id: nuevoId }];
    }
    this.cerrarModal();
  }

  eliminar(id: number) {
    this.reservas = this.reservas.filter(r => r.id !== id);
  }

  cerrarModal() {
    this.modalVisible = false;
    this.idEdicion = null;
  }
}
