import { Timestamp } from '@angular/fire/firestore';

export interface User {
    email: string;
    displayName: string;
    role: 'patient' | 'doctor';
    specialization?: string;
    phoneNumber?: string;
    createdAt: Timestamp;
  }

export interface DoctorSchedule {
    doctorId: string;
    weeklyAvailability: {
    monday: { start: string; end: string; };
    tuesday: { start: string; end: string; };
    wednesday: { start: string; end: string; };
    thursday: { start: string; end: string; };
    friday: { start: string; end: string; };
    saturday: { start: string; end: string; };
    sunday: { start: string; end: string; };
    };
    exceptions: {
        date: Timestamp;
        available: boolean;
        customHours?: { start: string; end: string; };
      }[];
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