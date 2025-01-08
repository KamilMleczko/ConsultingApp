import { Component } from '@angular/core';
import { FormBuilder, Validators,  FormGroup, ReactiveFormsModule, } from '@angular/forms';
import { DataBaseFacadeService } from '../../../services/data-base-facade-service/data-base-facade.service';
import { Injectable, inject } from '@angular/core';
import { WeeklySchedule , DoctorSchedule} from '../../../interfaces/firestoreTypes';
import { CommonModule } from '@angular/common'; 
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
@Component({
  selector: 'app-optional-buttons',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './optional-buttons.component.html',
  styleUrl: './optional-buttons.component.scss'
})
export class OptionalButtonsComponent {
  private dbFacade = inject(DataBaseFacadeService);
  private firestore = inject(Firestore);
  private fb = inject(FormBuilder);

  
  showSchedules = false;
  schedules: DoctorSchedule[] = [];
  loading$ = this.dbFacade.loading$;
  error$ = this.dbFacade.error$;
  showForm = false;
  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  doctorId = 'sample-doctor-id'; // Hardcoded for now

  showSingleDayForm = false;
  singleDayForm = this.fb.group({
  date: ['', Validators.required],
  start: ['', Validators.required],
  end: ['', Validators.required]
  });


  scheduleForm = this.fb.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    weeklyAvailability: this.fb.group({
      monday: this.createTimeGroup(),
      tuesday: this.createTimeGroup(),
      wednesday: this.createTimeGroup(),
      thursday: this.createTimeGroup(),
      friday: this.createTimeGroup(),
      saturday: this.createTimeGroup(),
      sunday: this.createTimeGroup()
    })
  });

  private createTimeGroup() {
    return this.fb.group({
      start: [''],
      end: ['']
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  private async checkScheduleOverlap(startDate: Date, endDate: Date): Promise<boolean> {
    try {
      const schedulesRef = collection(this.firestore, 'doctorSchedules');
      const q = query(schedulesRef, where('doctorId', '==', this.doctorId));
      const querySnapshot = await getDocs(q);
      
      for (const doc of querySnapshot.docs) {
        const schedule = doc.data() as DoctorSchedule;
        
        for (const period of schedule.schedulePeriods) {
          const periodStart = period.startDate.toDate();
          const periodEnd = period.endDate.toDate();
          
          
          // Check if dates overlap
          if (
            (startDate <= periodEnd && startDate >= periodStart) || // New start date falls within existing period
            (endDate <= periodEnd && endDate >= periodStart) || // New end date falls within existing period
            (startDate <= periodStart && endDate >= periodEnd)// New period completely encompasses existing period
          ) {
            return true; // Overlap found
          }
        }
      }
      
      return false; // No overlap found
    } catch (error) {
      console.error('Error checking schedule overlap:', error);
      throw new Error('Failed to check schedule overlap');
    }
  }

  async submitSchedule() {
    if (this.scheduleForm.valid) {
      const formValue = this.scheduleForm.value;
      const startDate = new Date(formValue.startDate!);
      const endDate = new Date(formValue.endDate!);

      try {
        // Check for date validity
        if (startDate >= endDate) {
          alert('End date must be after start date');
          return;
        }

        // Check for schedule overlap
        const hasOverlap = await this.checkScheduleOverlap(startDate, endDate);
        if (hasOverlap) {
          alert('This schedule overlaps with an existing schedule. Please choose different dates.');
          return;
        }

        // If no overlap, proceed with creating the schedule
        const weeklyAvailability: WeeklySchedule = {};
        
        Object.entries(formValue.weeklyAvailability || {}).forEach(([day, times]) => {
          if (times?.start && times?.end) {
            weeklyAvailability[day as keyof WeeklySchedule] = {
              start: times.start,
              end: times.end
            };
          }
        });

        await this.dbFacade.addDoctorSchedule(this.doctorId, {
          startDate: startDate,
          endDate: endDate,
          weeklyAvailability
        });
        
        this.scheduleForm.reset();
        this.showForm = false;
        this.schedules = await this.dbFacade.getDoctorSchedules(this.doctorId);
        alert('Schedule added successfully');
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert('Error adding schedule');
        }
      }
    }
  }
  


  async toggleSchedules() {
    this.showSchedules = !this.showSchedules;
      console.log('Fetching schedules...');
      try {
        this.schedules = await this.dbFacade.getDoctorSchedules(this.doctorId);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
  }
  hideSchedules() {
    this.showSchedules = false;
  }
  
  getAvailableDays(weeklyAvailability: WeeklySchedule): string[] {
    return Object.entries(weeklyAvailability)
      .filter(([_, times]) => times && times.start && times.end)
      .map(([day]) => day);
  }


  toggleSingleDayForm() {
    this.showSingleDayForm = !this.showSingleDayForm;
  }
  
  async submitSingleDay() {
    if (this.singleDayForm.valid) {
      const formValue = this.singleDayForm.value;
      const date = new Date(formValue.date!);

      
      const hasOverlap = await this.checkScheduleOverlap(date, date);
      if (hasOverlap) {
        alert('This schedule overlaps with an existing schedule. Please choose different dates.');
        return;
      }
  
      try {
        await this.dbFacade.addSingleDaySchedule(this.doctorId, date, {
          start: formValue.start!,
          end: formValue.end!
        });
        
        this.singleDayForm.reset();
        this.showSingleDayForm = false;
        alert('Single day schedule added successfully');
      } catch (error) {
        alert('Error adding single day schedule');
      }
    }
  }

  async deleteSchedule(scheduleId : string) {
    if (confirm('Are you sure you want to delete this schedule?')) {
      try {
        await this.dbFacade.removeDoctorScheduleById(scheduleId);
        this.schedules = await this.dbFacade.getDoctorSchedules(this.doctorId);
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  }



  
}