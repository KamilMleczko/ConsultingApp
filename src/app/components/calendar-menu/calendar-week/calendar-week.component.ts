
import { CommonModule } from '@angular/common';
import { Component, input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { WeeklySchedule, DoctorSchedule, SchedulePeriod, 
  Appointment, AppointmentWithoutId , AppointmentStatus,
  AppointmentType
} from '../../../interfaces/firestoreTypes';
import { Firestore, collection, query, where, getDocs, Timestamp } from '@angular/fire/firestore';
import { DataBaseFacadeService } from '../../../services/data-base-facade-service/data-base-facade.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth-service/auth.service';
import { CommunicationService } from '../../../services/communication-service/communication.service';

interface TimeSlot {
  time: string;
  displayTime: string; 
  daySlots: DaySlot[];
}

interface DaySlot {
  day: number;
  time: string;
  date: number;
  appointmentCount: number;
  appointment?: Appointment;
  patientName?: string;
  isUsersAppointment?: boolean;
  patientSurname?: string;
  available: boolean;
  outdated: boolean;
  exception : boolean;
  
}


@Component({
  selector: 'app-calendar-week',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './calendar-week.component.html',
  styleUrl: './calendar-week.component.scss'
})
export class CalendarWeekComponent implements OnInit, OnChanges{
  weekDays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  timeSlots: TimeSlot[] = [];
  currentDate: Date = new Date();

  receivedDate = input<Date>();
  receivedDoctorId = input<string>();
  private firestore: Firestore = inject(Firestore);
  private authService  = inject(AuthService)
  schedules: DoctorSchedule[] = [];
  private dbFacade: DataBaseFacadeService = inject(DataBaseFacadeService);
  private fb = inject(FormBuilder);
  private communicationService = inject(CommunicationService);
  currentSchedule: WeeklySchedule | null = null;

  showAppointmentForm = false;
  currentSlot: DaySlot | null = null;
  appointmentForm = this.fb.group({
    type: ['', Validators.required],
    notes: ['']
  });
  appointments: Appointment[] = [];

  async ngOnInit():  Promise<void>{
    if ((this.authService.currentUserSig()?.role == "doctor")
      && this.authService.firebaseAuth.currentUser){ 
      await this.updateScheduleForCurrentWeek(this.authService.firebaseAuth.currentUser.uid);
      await this.generateTimeSlots(this.authService.firebaseAuth.currentUser.uid);
    }
    else if (this.receivedDoctorId === undefined){ 
      await this.updateScheduleForCurrentWeek('');
      await this.generateTimeSlots('');
    }
    else{ 
    await this.updateScheduleForCurrentWeek(this.receivedDoctorId.toString().replace(/^\[Input Signal: /, '').replace(/\]$/, ''));
    await this.generateTimeSlots(this.receivedDoctorId.toString().replace(/^\[Input Signal: /, '').replace(/\]$/, ''));
    }

    //for regenerating calendar after changes via additional-buttons component
    this.communicationService.functionCalled$.subscribe(() => {
      this.handleFunctionCall();
    });
  }

  private async handleFunctionCall() {
    try {
      if ((this.authService.currentUserSig()?.role == "doctor")
        && this.authService.firebaseAuth.currentUser){ 
        await this.updateScheduleForCurrentWeek(this.authService.firebaseAuth.currentUser.uid);
        await this.generateTimeSlots(this.authService.firebaseAuth.currentUser.uid);
      }
      else if (!this.receivedDoctorId || this.receivedDoctorId.toString().replace(/^\[Input Signal: /, '').replace(/\]$/, '') === ''){ 
        await this.updateScheduleForCurrentWeek('');
        await this.generateTimeSlots('');
      }
      else{ 
      await this.updateScheduleForCurrentWeek(this.receivedDoctorId.toString().replace(/^\[Input Signal: /, '').replace(/\]$/, ''));
      await this.generateTimeSlots(this.receivedDoctorId.toString().replace(/^\[Input Signal: /, '').replace(/\]$/, ''));
      }
    } catch (error) {
      console.error("Error handling function call:", error);
    }
  }
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['receivedDate'] && !changes['receivedDate'].firstChange ) {
      this.currentDate = new Date(changes['receivedDate'].currentValue);
      if (!this.receivedDoctorId || this.receivedDoctorId.toString().replace(/^\[Input Signal: /, '').replace(/\]$/, '') === ''){
        if (this.authService.currentUserSig()?.role == "doctor" && this.authService.firebaseAuth.currentUser){ //its doctor view (does not use choose doctor button)
          await this.updateScheduleForCurrentWeek(this.authService.firebaseAuth.currentUser.uid);
          await this.generateTimeSlots(this.authService.firebaseAuth.currentUser.uid);
        }
        else{//its unlogged user
          await this.updateScheduleForCurrentWeek('');
          await this.generateTimeSlots('');
        }
      }else{//logged user tries to dsiplay doctor schedule
        await this.updateScheduleForCurrentWeek(this.receivedDoctorId.toString().replace(/^\[Input Signal: /, '').replace(/\]$/, ''));
        await this.generateTimeSlots(this.receivedDoctorId.toString().replace(/^\[Input Signal: /, '').replace(/\]$/, ''));
      }
    }
    else if ( changes['receivedDoctorId'] && !changes['receivedDoctorId'].firstChange){
      await this.updateScheduleForCurrentWeek(changes['receivedDoctorId'].currentValue);
      await this.generateTimeSlots(changes['receivedDoctorId'].currentValue);
    }
  }



  private async updateScheduleForCurrentWeek(doctorId: string): Promise<void> {
    const monday = this.getMonday(this.currentDate);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    if (doctorId === ''){
      this.schedules = [];
      this.currentSchedule = null;
      return;
    } 
    try {
      const schedulesRef = collection(this.firestore, 'doctorSchedules');
      const q = query(schedulesRef, where('doctorId', '==', doctorId));
      const querySnapshot = await getDocs(q);
      this.schedules = await this.dbFacade.getDoctorSchedules(doctorId);
      this.currentSchedule = null;

      querySnapshot.forEach((doc) => {
        const schedule = doc.data() as DoctorSchedule;
        const applicablePeriod = this.findApplicablePeriod(schedule.schedulePeriods, monday, sunday);
        if (applicablePeriod) {
          this.currentSchedule = applicablePeriod.weeklyAvailability;
        }
      });
    } catch (error) {
      console.error('Error fetching doctor schedule:', error);
    }
  }

  private findApplicablePeriod(
    periods: SchedulePeriod[], 
    weekStart: Date, 
    weekEnd: Date
  ): SchedulePeriod | null {
    return periods.find(period => {
      const periodStart = period.startDate.toDate();
      const periodEnd = period.endDate.toDate();
      
      return periodStart <= weekEnd && periodEnd >= weekStart;
    }) || null;
  }

  private isTimeInRange(time: string, daySchedule?: { start: string; end: string }): boolean {
    if (!daySchedule) return false;
    
    const [hours, minutes] = time.split(':').map(Number);
    const [startHours, startMinutes] = daySchedule.start.split(':').map(Number);
    const [endHours, endMinutes] = daySchedule.end.split(':').map(Number);
    
    const timeMinutes = hours * 60 + minutes;
    const startMinutes2 = startHours * 60 + startMinutes;
    const endMinutes2 = endHours * 60 + endMinutes;
    
    return timeMinutes >= startMinutes2 && timeMinutes < endMinutes2;
  }
   private  async generateTimeSlots(doctorId: string): Promise<void> {
    this.timeSlots = [];
    await this.loadAppointments(doctorId);
    const monday = this.getMonday(this.currentDate);

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const daySlots: DaySlot[] = [];

        for (let day = 0; day < 7; day++) {
          const currentDate = new Date(monday);
          currentDate.setDate(monday.getDate() + day);
          
          const dayName = this.weekDays[day].toLowerCase() as keyof WeeklySchedule;
          const daySchedule = this.currentSchedule?.[dayName];
          const isException = this.isDateInException(currentDate);

          const isOutdated = this.isDateTimeInPast(currentDate, timeString) 
          && !isException && this.isDateTimeInSchedule(currentDate, timeString) 
          && !this.isDateTimeInAppointment(currentDate, timeString);

          const isAvailable = !isException && this.isDateTimeInSchedule(currentDate, timeString) 
          && !this.isDateTimeInAppointment(currentDate, timeString)
          const type = 

          daySlots.push({
              day,
              time: timeString,
              date: currentDate.getDate(),
              appointmentCount: 0,
              available: isAvailable,
              outdated: isOutdated,
              exception: isException
          });
          
        }

        this.timeSlots.push({
          time: timeString,
          displayTime: timeString === "00:00" ? "" : timeString,
          daySlots
        });
      }
    }
    this.updateTimeslotStatus();
  }

  private getMonday(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
  }

  getDayDate(dayIndex: number): number {
    const date = new Date(this.currentDate);
    const monday = this.getMonday(date);
    monday.setDate(monday.getDate() + dayIndex);
    return monday.getDate();
  }

  getDayDateForException(dayIndex: number): Date {
    const date = new Date(this.currentDate);
    const monday = this.getMonday(date);
    monday.setDate(monday.getDate() + dayIndex);
    return monday;
  }



  isCurrentDay(dayIndex: number): boolean {
    const today = new Date();
    const cellDate = new Date(this.currentDate);
    const monday = this.getMonday(cellDate);
    monday.setDate(monday.getDate() + dayIndex);
    
    return today.getDate() === monday.getDate() && 
           today.getMonth() === monday.getMonth() &&
           today.getFullYear() === monday.getFullYear();
  }
  
  isCurrentTime(time: string): boolean {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    return now.getHours() === hours && 
          now.getMinutes() - minutes < 30 &&
          now.getMinutes() - minutes >= 0;
  }


  


  isDateInException(date: Date): boolean {
    const targetDate = new Date(date);
    targetDate.setHours(1, 0, 0, 0);
    for (const schedule of this.schedules) {
      const isInSchedulePeriod = schedule.schedulePeriods.some(period => {
        const periodStart = period.startDate.toDate();
        const periodEnd = period.endDate.toDate();
        return targetDate >= periodStart && targetDate <= periodEnd;
      });

      if (isInSchedulePeriod) {
        const isInException = schedule.exceptions.some(exception => {
          const exceptionStart = exception.startDate.toDate();
          const exceptionEnd = exception.endDate.toDate();
          return targetDate >= exceptionStart && targetDate <= exceptionEnd;
        });

        if (isInException) {
          return true;
        }
      }
    }

    return false;
  }
  
  private isDateTimeInSchedule(date: Date, time: string): boolean {
    if (!this.schedules.length) return false;

    const dateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    dateTime.setHours(hours, minutes, 0, 0);

    for (const schedule of this.schedules) {
      for (const period of schedule.schedulePeriods) {
        const periodStart = period.startDate.toDate();
        const periodEnd = period.endDate.toDate();

        if (dateTime >= periodStart && dateTime <= periodEnd) {
          const dayName = this.weekDays[dateTime.getDay() === 0 ? 6 : dateTime.getDay() - 1]
            .toLowerCase() as keyof WeeklySchedule;
          const daySchedule = period.weeklyAvailability[dayName];

          if (daySchedule) {
            return this.isTimeInRange(time, daySchedule);
          }
        }
      }
    }
    return false;
  }

  private async loadAppointments(doctorId: string): Promise<void> {
    if(doctorId == null){
      this.appointments = [];
      return;
    } 
    const monday = this.getMonday(this.currentDate);
    const appointments: Appointment[] = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      const dayAppointments = await this.dbFacade.getAppointmentsForDay(doctorId, currentDate);
      appointments.push(...dayAppointments);
    }
    this.appointments = appointments;
  }

  private updateTimeslotStatus(): void {
    const now = new Date();
    
    this.appointments.forEach(async appointment => {
      const appointmentDate = appointment.dateTime.toDate();
      const timeString = appointmentDate.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5);
      const dayIndex = (appointmentDate.getDay() + 6) % 7; // Convert to Monday-based index
      
      const timeSlot = this.timeSlots.find(slot => slot.time === timeString);
      if (timeSlot) {
        const daySlot = timeSlot.daySlots[dayIndex];
        daySlot.appointment = appointment;
        daySlot.patientName = await this.dbFacade.getUserById(appointment.patientId).then(user => user?.RealName);
        daySlot.patientSurname = await this.dbFacade.getUserById(appointment.patientId).then(user => user?.RealSurname);
        daySlot.isUsersAppointment = await this.isUsersAppointment(appointment);
        if (appointment.status === 'cancelled' || this.isDateInException(appointmentDate)) {
          appointment.status = 'cancelled';
          this.dbFacade.updateAppointmentStatus(appointment.id!, 'cancelled');
        } else if (appointmentDate < now && appointment.status === 'scheduled') {
          this.dbFacade.updateAppointmentStatus(appointment.id!, 'completed');
          appointment.status = 'completed';
        }
      }
    });
  }
  
  async onCellClick(daySlot: DaySlot): Promise<void> {
    if (this.authService.currentUserSig()?.role === 'doctor' || this.authService.currentUserSig()?.role === 'admin') return; 

    if (daySlot.appointment?.status === 'scheduled' && daySlot.appointment?.patientId === this.authService.firebaseAuth.currentUser?.uid ) {
      if (confirm('Do you want to cancel this appointment?') ) {
        await this.dbFacade.removeAppointment(daySlot.appointment.id!);
        daySlot.appointment = undefined;
        if (this.receivedDoctorId !== undefined){
          await this.generateTimeSlots(this.receivedDoctorId.toString().replace(/^\[Input Signal: /, '').replace(/\]$/, ''));
        }
        else{
          await this.generateTimeSlots('');
        }
      }
      return;
    }
  
    if (!daySlot.available || this.isDateInException(this.getDayDateForException(daySlot.day)) || daySlot.outdated) {
      return;
    }
    this.currentSlot = daySlot;
    this.showAppointmentForm = true;
  }
  
  async submitAppointment(): Promise<void> {
    if (this.appointmentForm.valid &&
       this.currentSlot && 
       this.authService.firebaseAuth.currentUser &&
       this.authService.currentUserSig()?.role == 'patient' &&
       this.receivedDoctorId !== undefined &&
       this.receivedDoctorId.toString().replace(/^\[Input Signal: /, '').replace(/\]$/, '') !== '') {
      const slotDate = this.getDayDateForException(this.currentSlot.day);
      const [hours, minutes] = this.currentSlot.time.split(':').map(Number);
      slotDate.setHours(hours, minutes, 0, 0);
  
      const appointmentData  = {
        doctorId: this.receivedDoctorId.toString().replace(/^\[Input Signal: /, '').replace(/\]$/, ''),
        patientId: this.authService.firebaseAuth.currentUser?.uid ,
        dateTime: Timestamp.fromDate(slotDate),
        timeRange: {
          start: this.currentSlot.time,
          end: this.addMinutesToTime(this.currentSlot.time, 30)
        },
        duration: 30,
        type: this.appointmentForm.value.type! as AppointmentType,
        notes: this.appointmentForm.value.notes ?? ""
      };
  
      await this.dbFacade.addAppointment(appointmentData);
      this.showAppointmentForm = false;
      this.appointmentForm.reset();
      this.currentSlot.available = false;
      this.currentSlot = null;
      await this.generateTimeSlots(this.receivedDoctorId.toString().replace(/^\[Input Signal: /, '').replace(/\]$/, ''),);
    }
  }
  
  private addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes);
    return date.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5);
  }
  
  getAppointmentCount(dayIndex: number): number {
    const date = this.getDayDateForException(dayIndex);
    return this.appointments.filter(appointment => {
      const appointmentDate = appointment.dateTime.toDate();
      return appointmentDate.getDate() === date.getDate() &&
             appointmentDate.getMonth() === date.getMonth() &&
             appointmentDate.getFullYear() === date.getFullYear() &&
             appointment.status === 'scheduled';
    }).length;
  }

  isDateTimeInAppointment(date: Date, time: string): boolean {
    if (!this.appointments.length) return false;
  
    const dateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    dateTime.setHours(hours, minutes, 0, 0);
    
    return this.appointments.some(appointment => {
      const appointmentDate = appointment.dateTime.toDate();
      return dateTime.getTime() === appointmentDate.getTime();
    });
  }


  private getAppointmentByDateTime(date: Date, time: string): Appointment | undefined {
    if (!this.appointments.length) return undefined;
  
    const dateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    dateTime.setHours(hours, minutes, 0, 0);
  
    return this.appointments.find(appointment => {
      const appointmentDate = appointment.dateTime.toDate();
      return dateTime.getTime() === appointmentDate.getTime();
    });

    
  }

  

  private isDateTimeInPast(date: Date, time: string): boolean {
    const dateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    dateTime.setHours(hours, minutes, 0, 0);

    return dateTime < new Date();
  }


  async isUsersAppointment(appointment: Appointment): Promise<boolean> {
    return this.authService.currentUserSig()?.role === 'patient' && 
           this.authService.firebaseAuth.currentUser?.uid === appointment.patientId;
  }

}