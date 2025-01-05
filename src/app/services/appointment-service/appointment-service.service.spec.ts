import { TestBed } from '@angular/core/testing';

import { AppointmentServiceService } from './appointment-service.service';

describe('AppointmentServiceService', () => {
  let service: AppointmentServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointmentServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
