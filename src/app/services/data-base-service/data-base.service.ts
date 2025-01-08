import { TimeRange } from './../../interfaces/firestoreTypes';


import { Injectable, inject } from '@angular/core';
import { Firestore, Timestamp, collection, 
        addDoc, doc, setDoc, 
        deleteDoc, query, where, 
        getDocs,updateDoc, arrayUnion , arrayRemove} from '@angular/fire/firestore';
import { DoctorSchedule, User, Appointment, WeeklySchedule, SchedulePeriod,DoctorScheduleWithoutId, Exception} from '../../interfaces/firestoreTypes';


@Injectable({
  providedIn: 'root'
})
export class DataBaseService {

  firestore: Firestore = inject(Firestore);

  async addUser(userData: Omit<User, 'createdAt'>): Promise<string> {
    try {
      const userWithTimestamp: User = {
        ...userData,
        createdAt: Timestamp.now()
      };
      
      const docRef = await addDoc(
        collection(this.firestore, 'users'),
        userWithTimestamp
      );
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding user:', error);
      throw new Error('Failed to add user');
    }
  }

  
  async removeUser(userId: string): Promise<void> {
    try {
      // First, check if user exists
      const userRef = doc(this.firestore, 'users', userId);
      
      // Delete related appointments
      const appointmentsQuery = query(
        collection(this.firestore, 'appointments'),
        where('doctorId', '==', userId)
      );
      const patientAppointmentsQuery = query(
        collection(this.firestore, 'appointments'),
        where('patientId', '==', userId)
      );

      const [doctorAppointments, patientAppointments] = await Promise.all([
        getDocs(appointmentsQuery),
        getDocs(patientAppointmentsQuery)
      ]);

      // Delete doctor schedule if user is a doctor
      const scheduleQuery = query(
        collection(this.firestore, 'doctorSchedules'),
        where('doctorId', '==', userId)
      );
      const scheduleSnapshot = await getDocs(scheduleQuery);

      // Perform all deletions
      const deletePromises = [
        deleteDoc(userRef),
        ...doctorAppointments.docs.map(doc => deleteDoc(doc.ref)),
        ...patientAppointments.docs.map(doc => deleteDoc(doc.ref)),
        ...scheduleSnapshot.docs.map(doc => deleteDoc(doc.ref))
      ];

      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error removing user:', error);
      throw new Error('Failed to remove user');
    }
  }

  // Doctor Schedule Operations
  async addDoctorSchedule(
    doctorId: string,
    scheduleData: {
      startDate: Date;
      endDate: Date;
      weeklyAvailability: WeeklySchedule;
    }
  ): Promise<string> {
    try {
      const schedulePeriod: SchedulePeriod = {
        startDate: Timestamp.fromDate(scheduleData.startDate),
        endDate: Timestamp.fromDate(scheduleData.endDate),
        weeklyAvailability: scheduleData.weeklyAvailability
      };

      const newSchedule: DoctorScheduleWithoutId = {
        doctorId,
        schedulePeriods: [schedulePeriod],
        exceptions: []
      };

      const docRef = await addDoc(
        collection(this.firestore, 'doctorSchedules'),
        newSchedule
      );
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding doctor schedule:', error);
      throw new Error('Failed to add doctor schedule');
    }
  }

  async removeDoctorSchedule(scheduleId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, 'doctorSchedules', scheduleId));
    } catch (error) {
      console.error('Error removing doctor schedule:', error);
      throw new Error('Failed to remove doctor schedule');
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
    try {
      const scheduleRef = doc(this.firestore, 'doctorSchedules', scheduleId);
      
      const newPeriod: SchedulePeriod = {
        startDate: Timestamp.fromDate(periodData.startDate),
        endDate: Timestamp.fromDate(periodData.endDate),
        weeklyAvailability: periodData.weeklyAvailability
      };

      await updateDoc(scheduleRef, {
        schedulePeriods: arrayUnion(newPeriod)
      });
    } catch (error) {
      console.error('Error adding schedule period:', error);
      throw new Error('Failed to add schedule period');
    }
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

  async getDoctorSchedules(doctorId: string): Promise<DoctorSchedule[]> {
    try {
      const schedulesRef = collection(this.firestore, 'doctorSchedules');
      const q = query(schedulesRef, where('doctorId', '==', doctorId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data() as DoctorSchedule,
        id: doc.id
      }));
    } catch (error) {
      console.error('Error fetching doctor schedules:', error);
      throw new Error('Failed to fetch doctor schedules');
    }
  }
  async addSingleDaySchedule(
    doctorId: string,
    date: Date,
    daySchedule: { start: string; end: string; }
  ): Promise<string> {
    try {
      const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
      const weeklyAvailability: WeeklySchedule = {
        [dayOfWeek]: { start: daySchedule.start, end: daySchedule.end }
      };
  
      const schedule: DoctorScheduleWithoutId = {
        
        doctorId,
        schedulePeriods: [{
          startDate: Timestamp.fromDate(date), 
          endDate: Timestamp.fromDate(date),
          weeklyAvailability
        }],
        exceptions: []
      };
  
      const docRef = await addDoc(collection(this.firestore, 'doctorSchedules'), schedule);
      return docRef.id;
    } catch (error) {
      console.error('Error adding single day schedule:', error);
      throw new Error('Failed to add single day schedule');
    }
  }
  async removeDoctorScheduleById(scheduleId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, 'doctorSchedules', scheduleId));
    } catch (error) {
      console.error('Error removing schedule:', error);
      throw new Error('Failed to remove schedule');
    }
  }


  async addExceptionToSchedule(scheduleId: string, exception: { startDate: Date; endDate: Date }): Promise<void> {
    try {
      const scheduleRef = doc(this.firestore, 'doctorSchedules', scheduleId);
      const exceptionData = {
        startDate: Timestamp.fromDate(exception.startDate),
        endDate: Timestamp.fromDate(exception.endDate)
      };
      
      await updateDoc(scheduleRef, {
        exceptions: arrayUnion(exceptionData)
      });
    } catch (error) {
      console.error('Error adding exception:', error);
      throw new Error('Failed to add exception');
    }
  }

  async removeExceptionFromSchedule(scheduleId: string, exception: Exception): Promise<void> {
    try {
      const scheduleRef = doc(this.firestore, 'doctorSchedules', scheduleId);
      await updateDoc(scheduleRef, {
        exceptions: arrayRemove({
          startDate: exception.startDate,
          endDate: exception.endDate
        })
      });
    } catch (error) {
      console.error('Error removing exception:', error);
      throw new Error('Failed to remove exception');
    }
  }
}
