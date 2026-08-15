import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Departamento, DepartamentoService } from '../../services/departamento.service';

@Component({
  selector: 'app-departamentos-tabla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departamentos-tabla.component.html',
  styleUrls: ['./departamentos-tabla.component.css'],
})
export class DepartamentosTablComponent implements OnInit {
  departamentos: any[] = [];

  modalVisible = false;

  modoEdicion = false;

  idEdicion: number | null = null;

  form: any = {};

  estados = ['Disponible', 'Ocupado', 'Mantenimiento'];

  constructor(private departamentoService: DepartamentoService) {}

  ngOnInit(): void {
    this.cargarDepartamentos();
  }

  // ==========================================
  // CARGAR
  // ==========================================

  cargarDepartamentos(): void {
    const lista = this.departamentoService.getDepartamentos();

    this.departamentos = lista.map((d) => ({
      id: d.id,
      titulo: d.Titulo,
      distrito: d.Distrito,
      precio: d.Precio_Noche,
      habitaciones: d.Habitaciones,
      banos: d.Banos,
      estado: 'Disponible',
      propietarioEmail: d.propietarioEmail,
    }));
  }

  // ==========================================
  // EDITAR
  // ==========================================

  abrirEditar(item: any): void {
    this.form = {
      ...item,
    };

    this.modoEdicion = true;

    this.idEdicion = item.id;

    this.modalVisible = true;
  }

  // ==========================================
  // GUARDAR
  // ==========================================

  guardar(): void {
    if (!this.modoEdicion) {
      return;
    }

    const departamento = this.departamentoService.getDepartamentoById(this.idEdicion!);

    if (!departamento) {
      return;
    }

    const actualizado: Departamento = {
      ...departamento,

      Titulo: this.form.titulo,

      Distrito: this.form.distrito,

      Precio_Noche: Number(this.form.precio),

      Habitaciones: Number(this.form.habitaciones),

      Banos: Number(this.form.banos),
    };

    this.departamentoService.actualizarDepartamento(actualizado);

    this.cargarDepartamentos();

    this.cerrarModal();
  }

  // ==========================================
  // ELIMINAR
  // ==========================================

  eliminar(id: number): void {
    const confirmar = confirm('¿Seguro que deseas eliminar este departamento?');

    if (!confirmar) {
      return;
    }

    this.departamentoService.eliminarDepartamento(id);

    this.cargarDepartamentos();
  }

  // ==========================================
  // CERRAR
  // ==========================================

  cerrarModal(): void {
    this.modalVisible = false;

    this.modoEdicion = false;

    this.idEdicion = null;

    this.form = {};
  }
}
