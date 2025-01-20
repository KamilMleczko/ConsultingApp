import { CommonModule } from '@angular/common';
import { Component, output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataBaseFacadeService } from '../../../services/data-base-facade-service/data-base-facade.service';
import { UserWithId } from '../../../interfaces/firestoreTypes';
@Component({
  selector: 'app-patient-buttons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-buttons.component.html',
  styleUrl: './patient-buttons.component.scss'
})
export class PatientButtonsComponent implements OnInit {
  doctors: UserWithId[] = [];
  selectedDoctorId: string = '';
  isDropdownOpen: boolean = false;
  doctorSelectedEvent = output<string>();

  constructor(private dbFacade: DataBaseFacadeService) {}

  async ngOnInit() {
    try {
      this.doctors = await this.dbFacade.getDoctors();
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectDoctor(doctorId: string) {
    this.selectedDoctorId = doctorId;
    this.isDropdownOpen = false;
    this.doctorSelectedEvent.emit(doctorId);
  }

  getSelectedDoctorName(): string {
    const doctor = this.doctors.find(d => d.id === this.selectedDoctorId);
    return doctor ? `${doctor.RealName} ${doctor.RealSurname} - ${doctor.specialization}` : '--none--';
  }
}