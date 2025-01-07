
import { Injectable, inject } from '@angular/core';
import { Firestore, Timestamp, collection, 
        addDoc, doc, setDoc, 
        deleteDoc, query, where, 
        getDocs,updateDoc, arrayUnion } from '@angular/fire/firestore';
import { DoctorSchedule, User, Appointment, TimeRange, WeeklySchedule, SchedulePeriod } from '../../interfaces/firestoreTypes';


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

      const newSchedule: DoctorSchedule = {
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


  async addExceptionToDoctorSchedule(
    scheduleId: string,
    exception: {
      date: Date;
      available: boolean;
      customHours?: TimeRange;
    }
  ): Promise<void> {
    try {
      const scheduleRef = doc(this.firestore, 'doctorSchedules', scheduleId);
      
      const exceptionWithTimestamp = {
        ...exception,
        date: Timestamp.fromDate(exception.date)
      };

      await updateDoc(scheduleRef, {
        exceptions: arrayUnion(exceptionWithTimestamp)
      });
    } catch (error) {
      console.error('Error adding exception to doctor schedule:', error);
      throw new Error('Failed to add exception to doctor schedule');
    }
  }

  // Appointment Operations
  async addAppointment(appointmentData: Omit<Appointment, 'dateTime'> & { dateTime: Date }): Promise<string> {
    try {
      const appointmentWithTimestamp: Appointment = {
        ...appointmentData,
        dateTime: Timestamp.fromDate(appointmentData.dateTime)
      };

      const docRef = await addDoc(
        collection(this.firestore, 'appointments'),
        appointmentWithTimestamp
      );
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding appointment:', error);
      throw new Error('Failed to add appointment');
    }
  }

  async removeAppointment(appointmentId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, 'appointments', appointmentId));
    } catch (error) {
      console.error('Error removing appointment:', error);
      throw new Error('Failed to remove appointment');
    }
  }

  async createSampleData() {
    // Create a doctor
    const doctorData: Omit<User, 'createdAt'> = {
      email: 'doctor@example.com',
      displayName: 'Dr. Smith',
      role: 'doctor',
      specialization: 'General Practice',
      age: 45,
      sex: 'male'
    };
    const doctorRef = await addDoc(collection(this.firestore, 'users'), 
      { ...doctorData, createdAt: Timestamp.now() }
    );
    const doctorId = doctorRef.id;

    // Create a patient
    const patientData: Omit<User, 'createdAt'> = {
      email: 'patient@example.com',
      displayName: 'John Doe',
      role: 'patient',
      phoneNumber: '123-456-789',
      age: 30,
      sex: 'male'
    };
    const patientRef = await addDoc(collection(this.firestore, 'users'),
      { ...patientData, createdAt: Timestamp.now() }
    );
    const patientId = patientRef.id;

    // Create doctor's schedule with multiple periods
    const scheduleData: DoctorSchedule = {
      doctorId: doctorId,
      schedulePeriods: [
        {
          startDate: Timestamp.fromDate(new Date('2025-03-05')),
          endDate: Timestamp.fromDate(new Date('2025-04-07')),
          weeklyAvailability: {
            monday: { start: '16:00', end: '19:00' },
            wednesday: { start: '09:00', end: '17:00' },
            friday: { start: '10:00', end: '15:00' }
          }
        },
        {
          startDate: Timestamp.fromDate(new Date('2025-04-08')),
          endDate: Timestamp.fromDate(new Date('2025-05-10')),
          weeklyAvailability: {
            monday: { start: '12:00', end: '16:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '14:00', end: '18:00' }
          }
        }
      ],
      exceptions: []
    };

    await addDoc(collection(this.firestore, 'doctorSchedules'), scheduleData);

    const appointmentsData = [
      {
        doctorId: doctorId,
        patientId: patientId,
        dateTime: Timestamp.fromDate(new Date('2025-03-06T16:30:00')), // Wednesday during first schedule period
        duration: 30,
        status: 'scheduled',
        type: 'initial consultation',
        notes: 'First visit'
      },
      {
        doctorId: doctorId,
        patientId: patientId,
        dateTime: Timestamp.fromDate(new Date('2025-04-10T10:00:00')), // Thursday during second schedule period
        duration: 45,
        status: 'scheduled',
        type: 'follow-up',
        notes: 'Follow-up appointment'
      }
    ];

    // Add all appointments
    for (const appointmentData of appointmentsData) {
      await addDoc(collection(this.firestore, 'appointments'), appointmentData);
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
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as DoctorSchedule;
        return {
          id: doc.id,
          doctorId: data.doctorId,
          schedulePeriods: data.schedulePeriods,
          exceptions: data.exceptions
        };
      }) as DoctorSchedule[];
    } catch (error) {
      console.error('Error fetching doctor schedules:', error);
      throw new Error('Failed to fetch doctor schedules');
    }
  }
  
}
