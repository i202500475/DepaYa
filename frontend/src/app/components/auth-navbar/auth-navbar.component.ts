import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './auth-navbar.component.html',
  styleUrls: ['./auth-navbar.component.css'],
})
export class AuthNavbarComponent {}
