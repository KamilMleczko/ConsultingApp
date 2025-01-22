import { TimeRange } from './../../interfaces/firestoreTypes';


import { Injectable, inject } from '@angular/core';
import { Firestore, Timestamp, collection, 
        addDoc, doc, setDoc, getDoc ,
        deleteDoc, query, where, 
        getDocs,updateDoc, arrayUnion , arrayRemove} from '@angular/fire/firestore';
import { DoctorSchedule, User, Appointment, WeeklySchedule, 
  SchedulePeriod,DoctorScheduleWithoutId, Exception, 
  AppointmentStatus, AppointmentWithoutId,UserWithId, 
  DoctorComment, DoctorCommentWithoutId, DoctorRating, DoctorRatingWithoutId} from '../../interfaces/firestoreTypes';


@Injectable({
  providedIn: 'root'
})
export class DataBaseService {

  private readonly firestore: Firestore = inject(Firestore);
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


  async addUserWithId(userId: string, userData: Omit<User, 'createdAt'>): Promise<void> {
    try {
      const userWithTimestamp: User = {
        ...userData,
        createdAt: Timestamp.now()
      };
      
      await setDoc(
        doc(this.firestore, 'users', userId),
        userWithTimestamp
      );
    } catch (error) {
      console.error('Error adding user:', error);
      throw new Error('Failed to add user');
    }
  }
  
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async removeUser(userId: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
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

      const scheduleQuery = query(
        collection(this.firestore, 'doctorSchedules'),
        where('doctorId', '==', userId)
      );
      const scheduleSnapshot = await getDocs(scheduleQuery);

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

  async addDoctorSchedule(
    doctorId: string,
    scheduleData: {
      startDate: Date;
      endDate: Date;
      weeklyAvailability: WeeklySchedule;
    }
  ): Promise<string> {

    
    scheduleData.endDate = new Date(scheduleData.endDate);
    scheduleData.endDate.setHours(23, 59, 0, 0);
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

  async deleteAllData() {

      const doctorSchedulesCollection = collection(this.firestore, 'doctorSchedules');
      const doctorSchedulesSnapshot = await getDocs(doctorSchedulesCollection);
      doctorSchedulesSnapshot.forEach(async (scheduleDoc) => {
        await deleteDoc(doc(doctorSchedulesCollection, scheduleDoc.id));
      });

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
    const endDate = new Date(date);
    endDate.setHours(23, 59, 0, 0); 
    try {
      const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
      const weeklyAvailability: WeeklySchedule = {
        [dayOfWeek]: { start: daySchedule.start, end: daySchedule.end }
      };
      console.log('Doctor ID: ', doctorId);
      const schedule: DoctorScheduleWithoutId = {
        
        doctorId,
        schedulePeriods: [{
          startDate: Timestamp.fromDate(date), 
          endDate: Timestamp.fromDate(endDate),
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

  async addAppointment(appointmentData: Omit<AppointmentWithoutId, 'status'>): Promise<string> {
    try {
      const appointment: AppointmentWithoutId = {
        ...appointmentData,
        status: 'scheduled'
      };
      
      const docRef = await addDoc(
        collection(this.firestore, 'appointments'),
        appointment
      );
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding appointment:', error);
      throw new Error('Failed to add appointment');
    }
  }
  
  async getAppointmentsForDay(doctorId: string, date: Date): Promise<Appointment[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const appointmentsRef = collection(this.firestore, 'appointments');
      const q = query(
        appointmentsRef,
        where('doctorId', '==', doctorId),
        where('dateTime', '>=', Timestamp.fromDate(startOfDay)),
        where('dateTime', '<=', Timestamp.fromDate(endOfDay))
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as Appointment[];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw new Error('Failed to fetch appointments');
    }
  }
  
  async updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Promise<void> {
    try {
      const appointmentRef = doc(this.firestore, 'appointments', appointmentId);
      await updateDoc(appointmentRef, { status });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw new Error('Failed to update appointment status');
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


  async getAppointmentsByPatientId(patientId: string): Promise<Appointment[]> {
    try {
      const appointmentsRef = collection(this.firestore, 'appointments');
      const q = query(
        appointmentsRef,
        where('patientId', '==', patientId),
        where('status', '==', 'scheduled')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as Appointment[];
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      throw new Error('Failed to fetch patient appointments');
    }
  }

  async getAllUsers(): Promise<UserWithId[]> {
    try {
      const usersSnapshot = await getDocs(collection(this.firestore, 'users'));
      return usersSnapshot.docs.map(doc => ({
        ...(doc.data() as User),
        id: doc.id  
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }


  async getDoctors(): Promise<UserWithId[]> {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('role', '==', 'doctor'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...(doc.data() as User),
        id: doc.id
      }));
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw new Error('Failed to fetch doctors');
    }
  }

  async addDoctorRating(ratingData: DoctorRatingWithoutId): Promise<string> {
    try {
      const docRef = await addDoc(
        collection(this.firestore, 'doctorRatings'),
        ratingData
      );
      return docRef.id;
    } catch (error) {
      console.error('Error adding doctor rating:', error);
      throw new Error('Failed to add doctor rating');
    }
  }
  
  async updateDoctorRating(ratingId: string, isLike: boolean): Promise<void> {
    try {
      const ratingRef = doc(this.firestore, 'doctorRatings', ratingId);
      await updateDoc(ratingRef, { isLike });
    } catch (error) {
      console.error('Error updating doctor rating:', error);
      throw new Error('Failed to update doctor rating');
    }
  }
  
  async getDoctorRatings(doctorId: string): Promise<DoctorRating[]> {
    try {
      const ratingsRef = collection(this.firestore, 'doctorRatings');
      const q = query(ratingsRef, where('doctorId', '==', doctorId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DoctorRating[];
    } catch (error) {
      console.error('Error fetching doctor ratings:', error);
      throw new Error('Failed to fetch doctor ratings');
    }
  }
  
  async getUserRating(doctorId: string, userId: string): Promise<DoctorRating | null> {
    try {
      const ratingsRef = collection(this.firestore, 'doctorRatings');
      const q = query(
        ratingsRef, 
        where('doctorId', '==', doctorId),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as DoctorRating;
    } catch (error) {
      console.error('Error fetching user rating:', error);
      throw new Error('Failed to fetch user rating');
    }
  }
  
  async addDoctorComment(commentData: DoctorCommentWithoutId): Promise<string> {
    try {
      const docRef = await addDoc(
        collection(this.firestore, 'doctorComments'),
        commentData
      );
      return docRef.id;
    } catch (error) {
      console.error('Error adding doctor comment:', error);
      throw new Error('Failed to add doctor comment');
    }
  }
  
  async getDoctorComments(doctorId: string): Promise<DoctorComment[]> {
    try {
      const commentsRef = collection(this.firestore, 'doctorComments');
      const q = query(
        commentsRef, 
        where('doctorId', '==', doctorId),
        where('isDoctorReply', '==', false)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DoctorComment[];
    } catch (error) {
      console.error('Error fetching doctor comments:', error);
      throw new Error('Failed to fetch doctor comments');
    }
  }
  
  async getDoctorCommentReplies(commentId: string): Promise<DoctorComment[]> {
    try {
      const repliesRef = collection(this.firestore, 'doctorComments');
      const q = query(
        repliesRef, 
        where('parentCommentId', '==', commentId),
        where('isDoctorReply', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DoctorComment[];
    } catch (error) {
      console.error('Error fetching comment replies:', error);
      throw new Error('Failed to fetch comment replies');
    }
  }
  
  async hasCompletedAppointment(userId: string, doctorId: string): Promise<boolean> {
    try {
      const appointmentsRef = collection(this.firestore, 'appointments');
      const q = query(
        appointmentsRef,
        where('patientId', '==', userId),
        where('doctorId', '==', doctorId),
        where('status', '==', 'completed')
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking completed appointments:', error);
      throw new Error('Failed to check completed appointments');
    }
  }

  async removeComment(commentId: string): Promise<void> {
    try {
      const repliesRef = collection(this.firestore, 'doctorComments');
      const repliesQuery = query(repliesRef, where('parentCommentId', '==', commentId));
      const repliesSnapshot = await getDocs(repliesQuery);
      
      await Promise.all(repliesSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      ));
      await deleteDoc(doc(this.firestore, 'doctorComments', commentId));
    } catch (error) {
      console.error('Error removing comment:', error);
      throw new Error('Failed to remove comment');
    }
  }
  async banUser(userId: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      await updateDoc(userRef, { isBanned: true });
    } catch (error) {
      console.error('Error banning user:', error);
      throw new Error('Failed to ban user');
    }
  }
  async unBanUser(userId: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      await updateDoc(userRef, { isBanned: false });
    } catch (error) {
      console.error('Error unbanning user:', error);
      throw new Error('Failed to unban user');
    }
  }

  async isUserBanned(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(this.firestore, 'users', userId));
    return userDoc.exists() ? (userDoc.data() as User).isBanned || false : false;
  } catch (error) {
    console.error('Error checking user ban status:', error);
    throw new Error('Failed to check user ban status');
  }
}
}
