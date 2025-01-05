import { Injectable, inject } from '@angular/core';
import { Firestore, Timestamp, collection, addDoc, doc, setDoc, deleteDoc, query, where, getDocs } from '@angular/fire/firestore';
import { DoctorSchedule, User, Appointment } from '../../interfaces/firestoreTypes';


@Injectable({
  providedIn: 'root'
})
export class DataBaseInitService {

  firestore: Firestore = inject(Firestore);

  async createSampleData() {
    // Create a doctor
    const doctorData: User = {
      email: 'doctor@example.com',
      displayName: 'Dr. Smith',
      role: 'doctor',
      specialization: 'General Practice',
      createdAt: Timestamp.now()
    };
    
    const doctorRef = await addDoc(collection(this.firestore, 'users'), doctorData);
    const doctorId = doctorRef.id;

    // Create a patient
    const patientData: User = {
      email: 'patient@example.com',
      displayName: 'John Doe',
      role: 'patient',
      phoneNumber: '123-456-789',
      createdAt: Timestamp.now()
    };
    
    const patientRef = await addDoc(collection(this.firestore, 'users'), patientData);
    const patientId = patientRef.id;

    // Create doctor's schedule
    const scheduleData: DoctorSchedule = {
      doctorId: doctorId,
      weeklyAvailability: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: { start: '', end: '' },
        sunday: { start: '', end: '' }
      },
      exceptions: []
    };
    
    await addDoc(collection(this.firestore, 'doctorSchedules'), scheduleData);

    // Create an appointment
    const appointmentData: Appointment = {
      doctorId: doctorId,
      patientId: patientId,
      dateTime: Timestamp.fromDate(new Date('2025-01-10T10:00:00')),
      duration: 30,
      status: 'scheduled',
      type: 'initial consultation'
    };
    
    await addDoc(collection(this.firestore, 'appointments'), appointmentData);
  }

  async deleteAllData() {
   
      // Delete all users
      const usersCollection = collection(this.firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      usersSnapshot.forEach(async (userDoc) => {
        await deleteDoc(doc(usersCollection, userDoc.id));
      });

      // Delete all doctor schedules
      const doctorSchedulesCollection = collection(this.firestore, 'doctorSchedules');
      const doctorSchedulesSnapshot = await getDocs(doctorSchedulesCollection);
      doctorSchedulesSnapshot.forEach(async (scheduleDoc) => {
        await deleteDoc(doc(doctorSchedulesCollection, scheduleDoc.id));
      });

      // Delete all appointments
      const appointmentsCollection = collection(this.firestore, 'appointments');
      const appointmentsSnapshot = await getDocs(appointmentsCollection);
      appointmentsSnapshot.forEach(async (appointmentDoc) => {
        await deleteDoc(doc(appointmentsCollection, appointmentDoc.id));
      });

  }
}
