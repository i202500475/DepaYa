import { Component } from '@angular/core';

/**
 * Componente Footer
 * Muestra información corporativa y derechos de autor.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
}
