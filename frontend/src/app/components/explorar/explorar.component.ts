import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartamentoService } from '../../services/departamento.service';
import { DepartamentoCardComponent } from '../departamento-card/departamento-card.component';

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [CommonModule, DepartamentoCardComponent],
  templateUrl: './explorar.component.html',
  styleUrls: ['./explorar.component.css'],
})
export class ExplorarComponent implements OnInit {
  listaDepartamentos: any[] = [];

  constructor(private departamentoService: DepartamentoService) {}

  ngOnInit(): void {
    this.listaDepartamentos = this.departamentoService.getDepartamentos();
  }
}
