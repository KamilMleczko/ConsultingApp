import { DataBaseFacadeService } from '../../services/data-base-facade-service/data-base-facade.service';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { DoctorSchedule, User, Appointment, AppointmentStatus } from '../../interfaces/firestoreTypes';
import { CommonModule, AsyncPipe } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-database-handler',
  standalone: true,
  imports: [NavbarComponent,CommonModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent {

  dbFacade: DataBaseFacadeService = inject(DataBaseFacadeService);
  loading$ = this.dbFacade.loading$;
  error$ = this.dbFacade.error$;
  
  // Sample IDs for demonstration - in real app, these would come from your app state or user input
   sampleUserId = 'sample-user-id';
   sampleScheduleId = 'sample-schedule-id';
   sampleAppointmentId = 'sample-appointment-id';
  
  async clearDatabase(): Promise<void> {
    try {
      await this.dbFacade.clearAllData();
      this.showSuccess('All data deleted successfully');
    } catch (error) {
      this.showError('Error deleting data');
    }
  }

  // User operations
  async addDoctor(): Promise<void> {
    try {
      const doctorData: Omit<User, 'createdAt'> = {
        email: 'newdoctor@example.com',
        displayName: 'Dr. New Doctor',
        RealName: 'Jane',
        RealSurname: 'Smith',
        role: 'doctor',
        specialization: 'General Practice',
        age: 45,
        sex: 'male'
      };
      
      const userId = await this.dbFacade.addUser(doctorData);
      this.showSuccess(`Doctor added successfully with ID: ${userId}`);
    } catch (error) {
      this.showError('Error adding doctor');
    }
  }

  async addPatient(): Promise<void> {
    try {
      const patientData: Omit<User, 'createdAt'> = {
        email: 'newpatient@example.com',
        displayName: 'New Patient',
        RealName: 'John',
        RealSurname: 'Doe',
        role: 'patient',
        phoneNumber: '123-456-789',
        age: 28,
        sex: 'female'
      };
      
      const userId = await this.dbFacade.addUser(patientData);
      this.showSuccess(`Patient added successfully with ID: ${userId}`);
    } catch (error) {
      this.showError('Error adding patient');
    }
  }

  async removeUser(userId: string): Promise<void> {
    try {
      await this.dbFacade.removeUser(userId);
      this.showSuccess('User removed successfully');
    } catch (error) {
      this.showError('Error removing user');
    }
  }

  // Schedule operations
  async addInitialDoctorSchedule(): Promise<void> {
    try {
      const scheduleData = {
        startDate: new Date('2025-03-05'),
        endDate: new Date('2025-04-07'),
        weeklyAvailability: {
          monday: { start: '16:00', end: '19:00' },
          wednesday: { start: '09:00', end: '17:00' },
          friday: { start: '10:00', end: '15:00' }
        }
      };
      
      const scheduleId = await this.dbFacade.addDoctorSchedule(this.sampleUserId, scheduleData);
      this.showSuccess(`Schedule added successfully with ID: ${scheduleId}`);
    } catch (error) {
      this.showError('Error adding schedule');
    }
  }

  async addSchedulePeriod(): Promise<void> {
    try {
      const periodData = {
        startDate: new Date('2025-04-08'),
        endDate: new Date('2025-05-10'),
        weeklyAvailability: {
          monday: { start: '12:00', end: '16:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '14:00', end: '18:00' }
        }
      };
      
      await this.dbFacade.addSchedulePeriod(this.sampleScheduleId, periodData);
      this.showSuccess('Schedule period added successfully');
    } catch (error) {
      this.showError('Error adding schedule period');
    }
  }

  

  async removeSchedule(scheduleId: string): Promise<void> {
    try {
      await this.dbFacade.removeDoctorSchedule(scheduleId);
      this.showSuccess('Schedule removed successfully');
    } catch (error) {
      this.showError('Error removing schedule');
    }
  }


  
  private showSuccess(message: string): void {
    // Replace with your preferred notification method
    alert(message);
  }
  
  private showError(message: string): void {
    // Replace with your preferred notification method
    alert(message);
  }
  
}