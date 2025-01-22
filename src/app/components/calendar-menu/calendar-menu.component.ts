import { Component, inject } from '@angular/core';
import { CalendarComponent } from './calendar/calendar.component';
import { CalendarWeekComponent } from './calendar-week/calendar-week.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { OptionalButtonsComponent } from './optional-buttons/optional-buttons.component';
import { AuthService } from '../../services/auth-service/auth.service';
import { PatientButtonsComponent } from './patient-buttons/patient-buttons.component';
@Component({
  selector: 'app-calendar-menu',
  standalone: true,
  imports: [CalendarComponent, CalendarWeekComponent, NavbarComponent, OptionalButtonsComponent, PatientButtonsComponent],
  templateUrl: './calendar-menu.component.html',
  styleUrl: './calendar-menu.component.scss'
})
export class CalendarMenuComponent {
  readonly authService  = inject(AuthService)
  receivedDate = new Date(); 
  receivedDoctorId = '';
  ReceiveSelectedDay(date: Date) {
    this.receivedDate = date;
  }
  onDoctorSelected(doctorId: string) {
    this.receivedDoctorId = doctorId;
  }
}
