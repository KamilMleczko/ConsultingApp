import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseHandlerComponent } from './database-handler.component';

describe('DatabaseHandlerComponent', () => {
  let component: DatabaseHandlerComponent;
  let fixture: ComponentFixture<DatabaseHandlerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatabaseHandlerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatabaseHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
