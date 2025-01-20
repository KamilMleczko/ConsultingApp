import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientButtonsComponent } from './patient-buttons.component';

describe('PatientButtonsComponent', () => {
  let component: PatientButtonsComponent;
  let fixture: ComponentFixture<PatientButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientButtonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
