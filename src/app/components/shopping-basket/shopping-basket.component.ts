import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { DataBaseFacadeService } from '../../services/data-base-facade-service/data-base-facade.service';
import { Appointment } from '../../interfaces/firestoreTypes';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { inject ,OnInit} from '@angular/core';
import { FooterComponent } from '../home-page/footer/footer.component';

@Component({
  selector: 'app-shopping-basket',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule, ReactiveFormsModule, FooterComponent],
  templateUrl: './shopping-basket.component.html',
  styleUrl: './shopping-basket.component.scss'
})
export class ShoppingBasketComponent  implements OnInit{
  private dbFacade = inject(DataBaseFacadeService);
  private fb = inject(FormBuilder);

  appointments: Appointment[] = [];
  loading = false;
  error: string | null = null;
  showPaymentForm = false;

  paymentForm: FormGroup = this.fb.group({
    paymentMethod: ['', Validators.required],
    cardNumber: [''],
    expiryDate: [''],
    cvv: [''],
    paypalEmail: [''],
    accountName: [''],
    iban: ['']
  });

  ngOnInit() {
    this.loadAppointments();
    this.setupPaymentFormValidation();
  }

  private setupPaymentFormValidation() {
    this.paymentForm.get('paymentMethod')?.valueChanges.subscribe(method => {
      const cardNumber = this.paymentForm.get('cardNumber');
      const expiryDate = this.paymentForm.get('expiryDate');
      const cvv = this.paymentForm.get('cvv');
      const paypalEmail = this.paymentForm.get('paypalEmail');
      const accountName = this.paymentForm.get('accountName');
      const iban = this.paymentForm.get('iban');

      // Reset all validators
      [cardNumber, expiryDate, cvv, paypalEmail, accountName, iban].forEach(control => {
        control?.clearValidators();
        control?.updateValueAndValidity();
      });

      // Set validators based on payment method
      if (method === 'card') {
        cardNumber?.setValidators([Validators.required, Validators.pattern(/^\d{16}$|^\d{4} \d{4} \d{4} \d{4}$/)]);
        expiryDate?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
        cvv?.setValidators([Validators.required, Validators.pattern(/^\d{3}$/)]);
      } else if (method === 'paypal') {
        paypalEmail?.setValidators([Validators.required, Validators.email]);
      } else if (method === 'bank') {
        accountName?.setValidators([Validators.required]);
        iban?.setValidators([Validators.required, Validators.pattern(/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/)]);
      }

      this.paymentForm.updateValueAndValidity();
    });
  }

  async loadAppointments() {
    this.loading = true;
    this.error = null;

    try {
      this.appointments = await this.dbFacade.getAppointmentsByPatientId('default-user-id');
      this.appointments.sort((a, b) => a.dateTime.toDate().getTime() - b.dateTime.toDate().getTime());
    } catch (error) {
      this.error = 'Failed to load appointments';
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  getTotalCost(): number {
    return this.appointments.length * 50;
  }

  processPayment() {
    if (this.paymentForm.valid) {
      // Mock payment processing
      console.log('Processing payment:', {
        method: this.paymentForm.value.paymentMethod,
        amount: this.getTotalCost(),
        details: this.paymentForm.value
      });
      
      alert('Payment processed successfully!');
      this.showPaymentForm = false;
      this.paymentForm.reset();
    }
  }

  deletingAppointments = new Set<string>();
  async deleteAppointment(appointment: Appointment) {
    if (!appointment.id) return;
    
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.deletingAppointments.add(appointment.id);
      
      try {
        await this.dbFacade.removeAppointment(appointment.id);
        this.appointments = this.appointments.filter(a => a.id !== appointment.id);
        
        if (this.appointments.length === 0) {
          this.showPaymentForm = false;
        }
      } catch (error) {
        console.error('Error deleting appointment:', error);
        this.error = 'Failed to delete appointment';
      } finally {
        this.deletingAppointments.delete(appointment.id);
      }
    }
  }
  isDeletingAppointment(appointmentId: string): boolean {
    return this.deletingAppointments.has(appointmentId);
  }

}
