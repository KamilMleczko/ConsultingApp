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
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: string[] = [];
  currentDate = new Date();
  currentMonth = '';
  currentYear = '';
  
 
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
    
    for (let i = 0; i < firstDay.getDay(); i++) {
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
    this.generateCalendar();
  }

  previousMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1
    );
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
