import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataBaseService } from '../data-base-service/data-base.service';
import { User, Appointment, WeeklySchedule , DoctorSchedule} from '../../interfaces/firestoreTypes';


@Injectable({
  providedIn: 'root'
})
export class DataBaseFacadeService {
  private _loading = new BehaviorSubject<boolean>(false);
  private _error = new BehaviorSubject<string | null>(null);
  
  loading$ = this._loading.asObservable();
  error$ = this._error.asObservable();
  //constructor() { }
  private dbService: DataBaseService = inject(DataBaseService);


  async addUser(userData: Omit<User, 'createdAt'>): Promise<string> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      const userId = await this.dbService.addUser(userData);
      return userId;
    } catch (error) {
      this._error.next('Failed to add user');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }

  async removeUser(userId: string): Promise<void> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      await this.dbService.removeUser(userId);
    } catch (error) {
      this._error.next('Failed to remove user');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }

  // Doctor Schedule Operations
  async addDoctorSchedule(
    doctorId: string,
    scheduleData: {
      startDate: Date;
      endDate: Date;
      weeklyAvailability: WeeklySchedule;
    }): Promise<string>{

    this._loading.next(true);
    this._error.next(null);
    
    try {
      const scheduleId = await this.dbService.addDoctorSchedule(doctorId, scheduleData);
      return scheduleId;
    } catch (error) {
      this._error.next('Failed to add doctor schedule');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }

  async addSchedulePeriod(
    scheduleId: string,
    periodData: {
      startDate: Date;
      endDate: Date;
      weeklyAvailability: WeeklySchedule;
    }
  ): Promise<void> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      await this.dbService.addSchedulePeriod(scheduleId, periodData);
    } catch (error) {
      this._error.next('Failed to add schedule period');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }


  async removeDoctorSchedule(scheduleId: string): Promise<void> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      await this.dbService.removeDoctorSchedule(scheduleId);
    } catch (error) {
      this._error.next('Failed to remove doctor schedule');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }

  async addExceptionToDoctorSchedule(
    scheduleId: string,
    exception: {
      date: Date;
      available: boolean;
      customHours?: { start: string; end: string; }
    }
  ): Promise<void> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      await this.dbService.addExceptionToDoctorSchedule(scheduleId, exception);
    } catch (error) {
      this._error.next('Failed to add exception to doctor schedule');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }


  async addAppointment(appointmentData: Omit<Appointment, 'dateTime'> & { dateTime: Date }): Promise<string> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      const appointmentId = await this.dbService.addAppointment(appointmentData);
      return appointmentId;
    } catch (error) {
      this._error.next('Failed to add appointment');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }

  async removeAppointment(appointmentId: string): Promise<void> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      await this.dbService.removeAppointment(appointmentId);
    } catch (error) {
      this._error.next('Failed to remove appointment');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }

  // Existing sample data operations
  async initializeSampleData(): Promise<void> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      await this.dbService.createSampleData();
    } catch (error) {
      this._error.next('Failed to initialize sample data');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }
  
  async clearAllData(): Promise<void> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      await this.dbService.deleteAllData();
    } catch (error) {
      this._error.next('Failed to clear data');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }


  async getDoctorSchedules(doctorId: string): Promise<DoctorSchedule[]> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      return await this.dbService.getDoctorSchedules(doctorId);
    } catch (error) {
      this._error.next('Failed to fetch doctor schedules');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }

  
  
}
