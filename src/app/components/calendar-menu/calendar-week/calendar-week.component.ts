import { CommonModule } from '@angular/common';
import { Component, input, OnChanges, OnInit , SimpleChanges} from '@angular/core';
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
  

  ngOnInit(): void {
    this.generateTimeSlots();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['receivedDate'] && !changes['receivedDate'].firstChange) {
      this.currentDate = new Date(changes['receivedDate'].currentValue);
      this.generateTimeSlots();
    }
  }
  private generateTimeSlots(): void {
    this.timeSlots = [];
    // Get the monday of current week
    const monday = this.getMonday(this.currentDate);

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const daySlots: DaySlot[] = [];

        for (let day = 0; day < 7; day++) {
          const currentDate = new Date(monday);
          currentDate.setDate(monday.getDate() + day);
          
          daySlots.push({
            day,
            time: timeString,
            date: currentDate.getDate(),
            appointmentCount: 0,
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
