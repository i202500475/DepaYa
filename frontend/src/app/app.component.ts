import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthNavbarComponent } from './components/auth-navbar/auth-navbar.component';
import { DepartamentoFormularioComponent } from './components/departamento-formulario/departamento-formulario.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        NavbarComponent,
        AuthNavbarComponent,
        DepartamentoFormularioComponent,
        FooterComponent
    ],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class AppComponent {
    title = 'DepaYa';

    private rutasAuth = ['/login', '/registro'];

    constructor(private router: Router) {}

    get esRutaAuth(): boolean {
        return this.rutasAuth.includes(this.router.url);
    }
}
