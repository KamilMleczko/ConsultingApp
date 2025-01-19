import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../home-page/footer/footer.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { user } from '@angular/fire/auth';
import {AuthService} from '../../services/auth-service/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
    fb = inject(FormBuilder);
    authService  = inject(AuthService);
    router = inject(Router);
    
    loginForm = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email] ],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{6,}$/)]]
    });

    errorMessage : string | null = null;
  onSubmit(): void {
    const rawForm = this.loginForm.getRawValue();
    this.authService
      .login(rawForm.email, rawForm.password)
      .subscribe({
        next: () => {this.router.navigateByUrl('');},
        error: (err) => {this.errorMessage = err.code},
      });
  }    
}
