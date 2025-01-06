import { Timestamp } from '@angular/fire/firestore';


export interface User {
    email: string;
    displayName: string;
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
    doctorId: string;
    schedulePeriods: SchedulePeriod[];
    exceptions: Array<{
      date: Timestamp;
      available: boolean;
      customHours?: TimeRange;
    }>;
  }
export interface Appointment {
    doctorId: string;
    patientId: string;
    dateTime: Timestamp;
    duration: number;
    status: 'scheduled' | 'completed' | 'cancelled';
    type: string;
    notes?: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';
export type Sex = 'male' | 'female' | 'other';