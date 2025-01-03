import { Component, output } from '@angular/core';
import { OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { EventEmitter } from 'stream';
@Component({
  selector: 'app-calendar',
  imports: [NgFor],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit{
  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  calendarDays: string[] = [];
  currentDate = new Date();
  currentMonth = '';
  currentYear = '';
  selectedDay: string | null = null; //for clicked day coloring (not event handling)
  daySelectedEvent = output<Date>();

  calendarDayClick(day: string) {
    
    if (!day){
      alert("nie wybrano daty");
      return;
    } 
    const selectedDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(), //will work because currentDate is updated when changing calendar page
      parseInt(day)
    );
    this.selectedDay = day; //for clicked day coloring (not event handling)
    this.daySelectedEvent.emit(selectedDate);
    console.log(`Clicked: Day ${day}`);
  }
  ngOnInit() {
    this.generateCalendar();
  }


  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    

    this.currentMonth = new Date(year, month).toLocaleString('en-US', { month: 'long' });
    this.currentYear = year.toString();
    

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    this.calendarDays = [];
    
    const firstDayIndex = firstDay.getDay();
    const mondayStart = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
 
    for (let i = 0; i < mondayStart; i++) {
    this.calendarDays.push('');
    }
 
    for (let i = 1; i <= lastDay.getDate(); i++) {
      this.calendarDays.push(i.toString());
    }
  }

  nextMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1
    );
    this.selectedDay = null; //for clicked day coloring
    this.generateCalendar();
  }

  previousMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1
    );
    this.selectedDay = null; //for clicked day coloring
    this.generateCalendar();
  }

  isToday(day: string): boolean {
    if (!day) return false;
    
    const today = new Date();
    return today.getDate() === parseInt(day) &&
           today.getMonth() === this.currentDate.getMonth() &&
           today.getFullYear() === this.currentDate.getFullYear();
  }
}
