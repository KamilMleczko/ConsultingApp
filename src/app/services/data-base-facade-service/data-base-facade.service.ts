import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataBaseService } from '../data-base-service/data-base.service';
import { User, Appointment, WeeklySchedule , DoctorSchedule, Exception, 
  AppointmentStatus, AppointmentWithoutId, UserWithId, 
  DoctorComment, DoctorRating, DoctorCommentWithoutId, DoctorRatingWithoutId} from '../../interfaces/firestoreTypes';


@Injectable({
  providedIn: 'root'
})
export class DataBaseFacadeService {
  private _loading = new BehaviorSubject<boolean>(false);
  private _error = new BehaviorSubject<string | null>(null);
  
  loading$ = this._loading.asObservable();
  error$ = this._error.asObservable();
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

  async addUserWithId(userId: string, userData: Omit<User, 'createdAt'>): Promise<void> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      await this.dbService.addUserWithId(userId, userData);
    } catch (error) {
      this._error.next('Failed to add user');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      return await this.dbService.getUserById(userId);
    } catch (error) {
      this._error.next('Failed to fetch user');
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


  async addSingleDaySchedule(
    doctorId: string,
    date: Date,
    daySchedule: { start: string; end: string; }
  ): Promise<string> {
    this._loading.next(true);
    this._error.next(null);
    try {
      return await this.dbService.addSingleDaySchedule(doctorId, date, daySchedule);
    } catch (error) {
      this._error.next('Failed to add single day schedule');
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

  
 

  async removeDoctorScheduleById(scheduleId: string): Promise<void> {
    this._loading.next(true);
    this._error.next(null);
    try {
      await this.dbService.removeDoctorScheduleById(scheduleId);
    } catch (error) {
      this._error.next('Failed to remove schedule');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }


  async addExceptionToSchedule(scheduleId: string, exception: { startDate: Date; endDate: Date }): Promise<void> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      await this.dbService.addExceptionToSchedule(scheduleId, exception);
    } catch (error) {
      this._error.next('Failed to add exception');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }

  async removeExceptionFromSchedule(scheduleId: string, exception: Exception): Promise<void> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      await this.dbService.removeExceptionFromSchedule(scheduleId, exception);
    } catch (error) {
      this._error.next('Failed to remove exception');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }
  

  async addAppointment(appointmentData: Omit<AppointmentWithoutId, 'status'>): Promise<string> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      return await this.dbService.addAppointment(appointmentData);
    } catch (error) {
      this._error.next('Failed to add appointment');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }
  
  async getAppointmentsForDay(doctorId: string, date: Date): Promise<Appointment[]> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      return await this.dbService.getAppointmentsForDay(doctorId, date);
    } catch (error) {
      this._error.next('Failed to fetch appointments');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }
  
  async updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Promise<void> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      await this.dbService.updateAppointmentStatus(appointmentId, status);
    } catch (error) {
      this._error.next('Failed to update appointment status');
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


  async getAppointmentsByPatientId(patientId: string): Promise<Appointment[]> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      return await this.dbService.getAppointmentsByPatientId(patientId);
    } catch (error) {
      this._error.next('Failed to fetch patient appointments');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }

  async getAllUsers(): Promise<UserWithId[]> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      return await this.dbService.getAllUsers();
    } catch (error) {
      this._error.next('Failed to fetch users');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }

  async getDoctors(): Promise<UserWithId[]> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      return await this.dbService.getDoctors();
    } catch (error) {
      this._error.next('Failed to fetch doctors');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }

  async addDoctorRating(ratingData: DoctorRatingWithoutId): Promise<string> {
    this._loading.next(true);
    this._error.next(null);
  
    try {
      return await this.dbService.addDoctorRating(ratingData);
    } catch (error) {
      this._error.next('Failed to add doctor rating');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }
  
  async updateDoctorRating(ratingId: string, isLike: boolean): Promise<void> {
    this._loading.next(true);
    this._error.next(null);
  
    try {
      await this.dbService.updateDoctorRating(ratingId, isLike);
    } catch (error) {
      this._error.next('Failed to update doctor rating');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }
  
  async getDoctorRatings(doctorId: string): Promise<DoctorRating[]> {
    this._loading.next(true);
    this._error.next(null);
  
    try {
      return await this.dbService.getDoctorRatings(doctorId);
    } catch (error) {
      this._error.next('Failed to fetch doctor ratings');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }
  
  async getUserRating(doctorId: string, userId: string): Promise<DoctorRating | null> {
    this._loading.next(true);
    this._error.next(null);
  
    try {
      return await this.dbService.getUserRating(doctorId, userId);
    } catch (error) {
      this._error.next('Failed to fetch user rating');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }
  
  async addDoctorComment(commentData: DoctorCommentWithoutId): Promise<string> {
    this._loading.next(true);
    this._error.next(null);
  
    try {
      return await this.dbService.addDoctorComment(commentData);
    } catch (error) {
      this._error.next('Failed to add doctor comment');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }
  
  async getDoctorComments(doctorId: string): Promise<DoctorComment[]> {
    this._loading.next(true);
    this._error.next(null);
  
    try {
      return await this.dbService.getDoctorComments(doctorId);
    } catch (error) {
      this._error.next('Failed to fetch doctor comments');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }
  
  async getDoctorCommentReplies(commentId: string): Promise<DoctorComment[]> {
    this._loading.next(true);
    this._error.next(null);
  
    try {
      return await this.dbService.getDoctorCommentReplies(commentId);
    } catch (error) {
      this._error.next('Failed to fetch comment replies');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }
  
  async hasCompletedAppointment(userId: string, doctorId: string): Promise<boolean> {
    this._loading.next(true);
    this._error.next(null);
  
    try {
      return await this.dbService.hasCompletedAppointment(userId, doctorId);
    } catch (error) {
      this._error.next('Failed to check completed appointments');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }

  async removeComment(commentId: string): Promise<void> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      await this.dbService.removeComment(commentId);
    } catch (error) {
      this._error.next('Failed to remove comment');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }
  
  async banUser(userId: string): Promise<void> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      await this.dbService.banUser(userId);
    } catch (error) {
      this._error.next('Failed to ban user');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }

  async unBanUser(userId: string): Promise<void> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      await this.dbService.unBanUser(userId);
    } catch (error) {
      this._error.next('Failed to unban user');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }

  async isUserBanned(userId: string): Promise<boolean> {
    this._loading.next(true);
    this._error.next(null);
    
    try {
      return await this.dbService.isUserBanned(userId);
    } catch (error) {
      this._error.next('Failed to check if user is banned');
      throw error;
    } finally {
      this._loading.next(false);
    }
  }
}