import { CommonModule } from '@angular/common';
import { Component, input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { WeeklySchedule, DoctorSchedule, SchedulePeriod } from '../../../interfaces/firestoreTypes';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { DataBaseFacadeService } from '../../../services/data-base-facade-service/data-base-facade.service';

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
  available: boolean;
  events?: any[];
}


@Component({
  selector: 'app-calendar-week',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-week.component.html',
  styleUrl: './calendar-week.component.scss'
})
export class CalendarWeekComponent implements OnInit, OnChanges{
  weekDays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  timeSlots: TimeSlot[] = [];
  currentDate: Date = new Date();

  receivedDate = input<Date>();

  private firestore: Firestore = inject(Firestore);
  doctorId: string = 'sample-doctor-id'; // TODO: Replace in authorisation phase with userID
  currentSchedule: WeeklySchedule | null = null;

  async ngOnInit():  Promise<void>{
    await this.updateScheduleForCurrentWeek();
    this.generateTimeSlots();
  }
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['receivedDate'] && !changes['receivedDate'].firstChange) {
      this.currentDate = new Date(changes['receivedDate'].currentValue);
      await this.updateScheduleForCurrentWeek();
      this.generateTimeSlots();
    }
  }

  private async updateScheduleForCurrentWeek(): Promise<void> {
    const monday = this.getMonday(this.currentDate);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    try {
      const schedulesRef = collection(this.firestore, 'doctorSchedules');
      const q = query(schedulesRef, where('doctorId', '==', this.doctorId));
      const querySnapshot = await getDocs(q);

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
  private generateTimeSlots(): void {
    this.timeSlots = [];
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
          
          daySlots.push({
            day,
            time: timeString,
            date: currentDate.getDate(),
            appointmentCount: 0,
            available: this.isTimeInRange(timeString, daySchedule),
            events: []
          });
        }

        this.timeSlots.push({
          time: timeString,
          displayTime: timeString === "00:00" ? "" : timeString,
          daySlots
        });
      }
    }
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

  getAppointmentCount(dayIndex: number): number {
    // In future, this could fetch the actual count from a service
    return 0;
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


  
  onCellClick(daySlot: DaySlot): void {
    console.log(`Clicked: Day ${daySlot.day}, Time ${daySlot.time}, Date ${daySlot.date}`);
    // Handle cell click event later
  }
}