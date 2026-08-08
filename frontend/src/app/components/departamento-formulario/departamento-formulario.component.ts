import { Component } from '@angular/core';

/**
 * Componente Formulario de Inmuebles
 * Permite registrar nuevos departamentos.
 */
@Component({
  selector: 'app-departamento-formulario',
  standalone: true,
  templateUrl: './departamento-formulario.component.html',
  styleUrls: ['./departamento-formulario.component.css']
})
export class DepartamentoFormularioComponent {
  onSubmitProcess() {
    alert('¡Departamento publicado exitosamente en la plataforma!');
  }
}
