import { TestBed } from '@angular/core/testing';

import { DataBaseService } from './data-base.service';

describe('DataBaseInitService', () => {
  let service: DataBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataBaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
