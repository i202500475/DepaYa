import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-propietario',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './propietario.component.html',
  styleUrls: ['./propietario.component.css'],
})
export class PropietarioComponent {}
