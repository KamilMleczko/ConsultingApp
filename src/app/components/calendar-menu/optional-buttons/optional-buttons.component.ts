import { Component } from '@angular/core';
import { FormBuilder, Validators,  FormGroup, ReactiveFormsModule, } from '@angular/forms';
import { DataBaseFacadeService } from '../../../services/data-base-facade-service/data-base-facade.service';
import { Injectable, inject } from '@angular/core';
import { WeeklySchedule } from '../../../interfaces/firestoreTypes';
import { CommonModule } from '@angular/common'; 
@Component({
  selector: 'app-optional-buttons',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './optional-buttons.component.html',
  styleUrl: './optional-buttons.component.scss'
})
export class OptionalButtonsComponent {
  private dbFacade = inject(DataBaseFacadeService);
  private fb = inject(FormBuilder);
  
  showForm = false;
  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  doctorId = 'sample-doctor-id'; // Hardcoded for now

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

  async onSubmit() {
    if (this.scheduleForm.valid) {
      const formValue = this.scheduleForm.value;
      const weeklyAvailability: WeeklySchedule = {};
      
      Object.entries(formValue.weeklyAvailability || {}).forEach(([day, times]) => {
        if (times?.start && times?.end) {
          weeklyAvailability[day as keyof WeeklySchedule] = {
            start: times.start,
            end: times.end
          };
        }
      });

      try {
        await this.dbFacade.addDoctorSchedule(this.doctorId, {
          startDate: new Date(formValue.startDate!),
          endDate: new Date(formValue.endDate!),
          weeklyAvailability
        });
        this.scheduleForm.reset();
        this.showForm = false;
        alert('Schedule added successfully');
      } catch (error) {
        alert('Error adding schedule');
      }
    }
  }
}
