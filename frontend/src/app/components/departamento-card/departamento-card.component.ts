import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-departamento-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './departamento-card.component.html',
  styleUrls: ['./departamento-card.component.css']
})
export class DepartamentoCardComponent {

  @Input() departamento: any = null;

}
