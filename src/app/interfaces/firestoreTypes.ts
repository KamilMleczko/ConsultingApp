import { Timestamp } from '@angular/fire/firestore';


export interface User {
    email: string;
    displayName: string;
    RealName: string;
    RealSurname: string;
    role: 'patient' | 'doctor' | 'admin';
    specialization?: string;
    phoneNumber?: string;
    createdAt: Timestamp;
    age: number;
    sex: Sex;
    isBanned: boolean;
  }

  export interface UserWithId {
    id : string;
    email: string;
    displayName: string;
    RealName: string;
    RealSurname: string;
    role: 'patient' | 'doctor' | 'admin';
    specialization?: string;
    phoneNumber?: string;
    createdAt: Timestamp;
    age: number;
    sex: Sex;
    isBanned: boolean;
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
    status: AppointmentStatus;
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

export interface DoctorRating {
  id: string;
  doctorId: string;
  userId: string;
  isLike: boolean;
  createdAt: Timestamp;
}

export interface DoctorComment {
  id: string;
  doctorId: string;
  userId: string;
  content: string;
  createdAt: Timestamp;
  userDisplayName: string;
  parentCommentId?: string; 
  isDoctorReply?: boolean;
}

export interface DoctorRatingWithoutId {
  doctorId: string;
  userId: string;
  isLike: boolean;
  createdAt: Timestamp;
}

export interface DoctorCommentWithoutId {
  doctorId: string;
  userId: string;
  content: string;
  createdAt: Timestamp;
  userDisplayName: string;
  parentCommentId?: string;
  isDoctorReply?: boolean;
}