import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionalButtonsComponent } from './optional-buttons.component';

describe('OptionalButtonsComponent', () => {
  let component: OptionalButtonsComponent;
  let fixture: ComponentFixture<OptionalButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptionalButtonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OptionalButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
