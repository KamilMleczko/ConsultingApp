import { DataBaseFacadeService } from '../../services/data-base-facade-service/data-base-facade.service';
import { Component,  OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NavbarComponent } from "../navbar/navbar.component";
import { DoctorSchedule, User, Appointment, AppointmentStatus, UserWithId, Sex } from '../../interfaces/firestoreTypes';
import { CommonModule, AsyncPipe } from '@angular/common';
import { AuthService } from '../../services/auth-service/auth.service';
import { BehaviorSubject } from 'rxjs';
import { signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ReactiveFormsModule, Validators, FormBuilder, NgModel, FormsModule } from '@angular/forms';
@Component({
  selector: 'app-database-handler',
  standalone: true,
  imports: [NavbarComponent, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent implements OnInit {
  dbFacade = inject(DataBaseFacadeService);
  authService = inject(AuthService);
  loading$ = this.dbFacade.loading$;
  error$ = this.dbFacade.error$;
  showForm = false;
  private usersSubject = new BehaviorSubject<UserWithId[]>([]);
  users = signal<UserWithId[]>([]);

  persistenceOptions = ['LOCAL', 'SESSION', 'NONE'] as const;
  currentPersistence = signal<typeof this.persistenceOptions[number]>('LOCAL');
  constructor() {
    const storedPersistence = typeof window !== 'undefined' ? 
      localStorage?.getItem('authPersistence') as typeof this.persistenceOptions[number] : null;
    
    if (storedPersistence && this.persistenceOptions.includes(storedPersistence)) {
      this.currentPersistence.set(storedPersistence);
    }
  }

  fb = inject(FormBuilder);
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

  ngOnInit() {
    this.loadUsers();
    this.authService.setPersistence(this.currentPersistence());
  }

  async loadUsers() {
    try {
      const users = await this.dbFacade.getAllUsers();
      this.users.set(users);
    } catch (error) {
      this.showError('Error loading users');
    }
  }

  async confirmAndRemoveUser(userId: string) {
    if (confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
      await this.removeUser(userId);
    }
  }

  async confirmAndClearDatabase() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      await this.clearDatabase();
    }
  }

  async removeUser(userId: string): Promise<void> {
    try {
      // Remove from both Auth and Firestore
      await Promise.all([
        //this.authService.deleteUser(userId), //TODO: DODAC USUWANIE z firebase auth
        this.dbFacade.removeUser(userId)
      ]);
      
      // Update the users list
      const updatedUsers = this.users().filter(user => user.id !== userId);
      this.users.set(updatedUsers);
      
      this.showSuccess('User removed successfully');
    } catch (error) {
      this.showError('Error removing user');
    }
  }

  async clearDatabase(): Promise<void> {
    try {
      await this.dbFacade.clearAllData();
      this.users.set([]);
      this.showSuccess('All data deleted successfully');
    } catch (error) {
      this.showError('Error deleting data');
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }


  onSubmit(): void {
    if (this.registerForm.valid) {
      const formData = this.registerForm.getRawValue();
      
      // Create base user data without specialization
      const baseUserData = {
        email: formData.email,
        displayName: formData.displayName,
        RealName: formData.RealName,
        RealSurname: formData.RealSurname,
        role: formData.role as 'patient' | 'doctor' | 'admin',
        phoneNumber: formData.phoneNumber || '',
        age: formData.age,
        sex: formData.sex as Sex,
        isBanned: false
      };

      // Add specialization only for doctors
      const userData: Omit<User, 'createdAt'> = formData.role === 'doctor' 
        ? { ...baseUserData, specialization: formData.specialization }
        : baseUserData;

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

  private showSuccess(message: string): void {
    alert(message);
  }
  
  private showError(message: string): void {
    alert(message);
  }

  async changePersistence(type: typeof this.persistenceOptions[number]) {
    try {
      await this.authService.setPersistence(type);
      this.currentPersistence.set(type);
      localStorage.setItem('authPersistence', type);
      this.showSuccess(`Authentication persistence changed to ${type}`);
    } catch (error) {
      this.showError('Error changing persistence state');
    }
  }

  async banUser(userId: string) {
    try {
      await this.dbFacade.banUser(userId);
      this.showSuccess('User banned successfully');
    } catch (error) {
      this.showError('Error banning user');
    }
  }

  async unBanUser(userId: string) {
    try {
      await this.dbFacade.unBanUser(userId);
      this.showSuccess('User unbanned successfully');
    } catch (error) {
      this.showError('Error unbanning user');
    }
  }

}