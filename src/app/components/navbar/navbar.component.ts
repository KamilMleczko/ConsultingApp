import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth-service/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  readonly authService  = inject(AuthService)
  private readonly router = inject(Router)

  logout(): void {
    if (confirm('Do you want to log out?')) {
    this.authService.logout();
    this.router.navigate(['/']);
    }
  }
}
