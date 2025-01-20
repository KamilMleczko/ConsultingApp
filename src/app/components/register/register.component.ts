import { Router, RouterOutlet } from '@angular/router';

import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../home-page/footer/footer.component';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { user } from '@angular/fire/auth';
import {AuthService} from '../../services/auth-service/auth.service';
import { User, Sex } from '../../interfaces/firestoreTypes';



@Component({
  selector: 'app-register',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  authService  = inject(AuthService);
  router = inject(Router);
  registerForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{6,}$/)]],
    displayName: ['', Validators.required],
    RealName: ['', Validators.required],
    RealSurname: ['', Validators.required],
    role: ['patient', Validators.required],
    phoneNumber: [''],
    age: [0, [Validators.required, Validators.min(0)]],
    sex: ['male' as Sex, Validators.required],
    specialization: ['']
  });
   

  errorMessage : string | null = null;
  onSubmit(): void {
    if (this.registerForm.valid) {
      const formData = this.registerForm.getRawValue();
      
      // Create base user data without specialization
      const baseUserData = {
        email: formData.email,
        displayName: formData.displayName,
        RealName: formData.RealName,
        RealSurname: formData.RealSurname,
        role: formData.role as 'patient',
        phoneNumber: formData.phoneNumber || '',
        age: formData.age,
        sex: formData.sex as Sex,
      };

      const userData: Omit<User, 'createdAt'> = 
        baseUserData;

      this.authService.register(
        formData.email,
        formData.password,
        userData
      ).subscribe({
        next: () => { this.router.navigateByUrl(''); },
        error: (err) => { this.errorMessage = err.code },
      });
    }
  }
}
