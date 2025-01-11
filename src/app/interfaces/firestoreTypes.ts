import { Timestamp } from '@angular/fire/firestore';


export interface User {
    email: string;
    displayName: string;
    RealName: string;
    RealSurname: string;
    role: 'patient' | 'doctor';
    specialization?: string;
    phoneNumber?: string;
    createdAt: Timestamp;
    age: number;
    sex: Sex;
  }

  export interface TimeRange {
    start: string; // HH:mm format
    end: string;   // HH:mm format
  }
  
  export interface WeeklySchedule {
    monday?: TimeRange;
    tuesday?: TimeRange;
    wednesday?: TimeRange;
    thursday?: TimeRange;
    friday?: TimeRange;
    saturday?: TimeRange;
    sunday?: TimeRange;
  }
  
  export interface SchedulePeriod {
    startDate: Timestamp;
    endDate: Timestamp;
    weeklyAvailability: WeeklySchedule;
  }
  
  export interface DoctorSchedule {
    id: string;
    doctorId: string;
    schedulePeriods: SchedulePeriod[];
    exceptions: Exception[];
  }

  export interface DoctorScheduleWithoutId {
    doctorId: string;
    schedulePeriods: SchedulePeriod[];
    exceptions: Exception[];
    }

  export interface Exception{
    startDate: Timestamp;
    endDate: Timestamp;
  }
export interface Appointment {
    id: string;
    doctorId: string;
    patientId: string;
    dateTime: Timestamp; //np. 2022-12-31T12:00:00.000Z
    timeRange: TimeRange; //np. {start: '12:00', end: '13:00'}
    duration: number;
    status: AppointmentStatus
    type: AppointmentType;
    notes?: string;
}

export interface AppointmentWithoutId {
  doctorId: string;
  patientId: string;
  dateTime: Timestamp; //np. 2022-12-31T12:00:00.000Z
  timeRange: TimeRange; //np. {start: '12:00', end: '13:00'}
  duration: number;
  status: AppointmentStatus
  type: AppointmentType;
  notes?: string;
}
export type AppointmentType = 'first' | 'follow-up'| 'control' ;
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';
export type Sex = 'male' | 'female' | 'other';